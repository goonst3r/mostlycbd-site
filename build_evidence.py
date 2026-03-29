#!/usr/bin/env python3
"""
build_evidence.py — mostlyCBD Evidence Library Pipeline v1.2
=============================================================
Queries PubMed + OpenAlex for cannabis research, scores each result,
and writes candidates to pending.json for human review.

Usage:
    python build_evidence.py              # Full pipeline → pending.json
    python build_evidence.py --approve    # Merge approved entries → studies.json
    python build_evidence.py --stats      # Library stats
    python build_evidence.py --debug      # Show ALL results ignoring threshold
    python build_evidence.py --source pubmed    # PubMed only
    python build_evidence.py --source openalex  # OpenAlex only

APIs used (both free, no scraping):
    PubMed:    https://eutils.ncbi.nlm.nih.gov  (get free key at ncbi.nlm.nih.gov/account/)
    OpenAlex:  https://api.openalex.org         (no key required; add email for polite pool)

Config: edit the CONFIG block below.
"""

import json, time, re, os, argparse
from datetime import datetime, date, timedelta
import urllib.request, urllib.parse

# ═══════════════════════════════════════════
#  CONFIG — edit this section
# ═══════════════════════════════════════════

PUBMED_API_KEY   = ""          # Free: ncbi.nlm.nih.gov/account/ — raises rate limit 3→10 req/s
OPENALEX_EMAIL   = ""          # Optional but polite: puts you in OpenAlex's "polite pool"
STUDIES_FILE     = "studies.json"
PENDING_FILE     = "pending.json"
THRESHOLD        = 30          # Set to 30 based on real score data — you still review everything before publish
RESULTS_PER_QUERY = 15         # Per query per source
LOOKBACK_DAYS    = 3650        # 10yr backfill first run; set 90 for quarterly, 30 for monthly
PUBMED_SORT      = "date"      # "date" surfaces new papers on repeat runs; "relevance" for first

# ── Search topics (PubMed structured queries) ──────────────────────────────
# Field tags: [Title/Abstract], [MeSH Terms], [pt] = publication type
# Find MeSH terms: https://www.ncbi.nlm.nih.gov/mesh
PUBMED_TOPICS = [
    # Pain
    'cannabidiol[Title/Abstract] AND "chronic pain"[Title/Abstract]',
    'cannabidiol[Title/Abstract] AND "neuropathic pain"[Title/Abstract]',
    '"cannabis"[Title/Abstract] AND "pain"[MeSH Terms] AND ("systematic review"[pt] OR "meta-analysis"[pt])',
    '"THC" AND "CBD" AND "pain" AND ("ratio" OR "balanced")',
    '"cannabinoids" AND "nociception" AND ("clinical trial"[pt] OR "randomized"[Title/Abstract])',
    # Anxiety / Mental Health
    'cannabidiol[Title/Abstract] AND "anxiety disorders"[MeSH Terms]',
    '"cannabidiol"[Title/Abstract] AND "PTSD"[Title/Abstract]',
    '"cannabis"[Title/Abstract] AND "anxiety"[MeSH Terms] AND ("clinical trial"[pt] OR "systematic review"[pt])',
    '"cannabidiol"[Title/Abstract] AND "depression"[Title/Abstract]',
    '"CBD"[Title/Abstract] AND "social anxiety"[Title/Abstract]',
    # Sleep
    'cannabidiol[Title/Abstract] AND ("sleep"[MeSH Terms] OR "insomnia"[Title/Abstract])',
    '"cannabis"[Title/Abstract] AND "sleep quality"[Title/Abstract]',
    # Epilepsy
    'cannabidiol[Title/Abstract] AND "epilepsy"[MeSH Terms]',
    '"cannabis"[Title/Abstract] AND "seizure"[MeSH Terms] AND ("clinical trial"[pt] OR "systematic review"[pt])',
    '"Epidiolex"[Title/Abstract] OR (cannabidiol[Title/Abstract] AND "Dravet"[Title/Abstract])',
    # ECS / Mechanism
    '"endocannabinoid system"[Title/Abstract] AND ("pain"[MeSH Terms] OR "inflammation"[MeSH Terms])',
    '"endocannabinoid" AND ("deficiency" OR "clinical endocannabinoid deficiency")',
    '"anandamide"[Title/Abstract] AND ("pain"[Title/Abstract] OR "anxiety"[Title/Abstract])',
    # Inflammation / Immune
    'cannabidiol[Title/Abstract] AND "inflammation"[MeSH Terms] AND ("clinical trial"[pt] OR "review"[pt])',
    '"cannabinoids" AND "neuroinflammation"[Title/Abstract]',
    '"cannabis" AND "autoimmune"[MeSH Terms]',
    # Specific conditions
    '"cannabis" AND "multiple sclerosis"[MeSH Terms]',
    '"cannabidiol" AND "amyotrophic lateral sclerosis"[MeSH Terms]',
    '"cannabis" AND "fibromyalgia"[Title/Abstract]',
    '"cannabinoids" AND "cancer pain"[Title/Abstract]',
    '"cannabis" AND "Parkinson"[MeSH Terms]',
    '"CBD" AND "autism spectrum"[Title/Abstract]',
    '"cannabis" AND "inflammatory bowel"[MeSH Terms]',
    '"cannabidiol" AND "opioid"[Title/Abstract] AND ("reduction" OR "sparing" OR "withdrawal")',
    # Safety / Pharmacology
    '"cannabidiol" AND "safety"[Title/Abstract] AND ("clinical"[Title/Abstract] OR "trial"[pt])',
    '"cannabinoids" AND "drug interaction"[MeSH Terms]',
    '"full spectrum" AND "cannabis" AND ("entourage"[Title/Abstract] OR "terpene"[Title/Abstract])',
    # Policy / Access
    '"medical cannabis" AND "patient outcomes"[Title/Abstract]',
    '"medical marijuana" AND "quality of life"[MeSH Terms]',
]

# ── OpenAlex search queries (plain keyword strings) ───────────────────────
# OpenAlex doesn't use MeSH — just natural language keyword searches.
# These complement PubMed by surfacing papers PubMed may rank lower.
OPENALEX_TOPICS = [
    "cannabidiol chronic pain randomized trial",
    "cannabidiol neuropathic pain clinical",
    "cannabis anxiety disorder treatment",
    "CBD PTSD clinical study",
    "cannabidiol sleep insomnia",
    "cannabidiol epilepsy seizure",
    "endocannabinoid system inflammation",
    "cannabidiol safety clinical trial",
    "cannabis multiple sclerosis spasticity",
    "CBD opioid reduction sparing",
    "cannabidiol depression anxiety systematic review",
    "cannabis fibromyalgia pain",
    "endocannabinoid deficiency syndrome",
    "full spectrum cannabis entourage effect",
    "cannabidiol autism spectrum disorder",
    "cannabis Parkinson disease",
    "cannabidiol inflammatory bowel disease",
    "cannabis cancer pain palliative",
    "medical cannabis patient outcomes quality of life",
    "cannabinoid pharmacology bioavailability",
]

# ═══════════════════════════════════════════
#  SCORING CONFIG
# ═══════════════════════════════════════════

# PubMed publication type tags → score (primary signal — most reliable)
PUBTYPE_SCORES = {
    "meta-analysis":               25,
    "systematic review":           23,
    "randomized controlled trial": 22,
    "clinical trial, phase iii":   20,
    "clinical trial, phase ii":    18,
    "clinical trial":              17,
    "observational study":         12,
    "case reports":                 6,
    "review":                      10,
    "journal article":              8,   # fallback — at least it's peer-reviewed
}

# Text-based study type phrases → score (secondary signal — used when pubtype absent)
TEXT_TYPE_SCORES = {
    "meta-analysis": 25, "meta analysis": 25, "cochrane review": 24,
    "systematic review": 23, "systematic literature review": 22,
    "randomized controlled trial": 22, "randomised controlled trial": 22,
    "double-blind": 20, "double blind": 20,
    "placebo-controlled": 19, "placebo controlled": 19,
    "randomized": 18, "randomised": 18, "rct": 20,
    "phase iii": 20, "phase 3": 20, "phase ii": 18, "phase 2": 18,
    "clinical trial": 17, "open-label": 13, "open label": 13,
    "prospective": 13, "retrospective cohort": 11,
    "cohort study": 12, "observational": 11, "cross-sectional": 9,
    "case-control": 10, "case series": 8, "case report": 6,
    "narrative review": 8, "review": 8,
    "preclinical": 5, "animal model": 4, "in vivo": 4, "in vitro": 3,
}

# Journal substrings → score
JOURNAL_SCORES = {
    # Elite
    "new england journal": 15, "lancet": 15, "jama": 15,
    "bmj": 14, "annals of internal medicine": 14,
    "nature medicine": 14, "nature": 13,
    # Strong clinical
    "pain": 12, "journal of pain": 12, "european journal of pain": 11,
    "neuropsychopharmacology": 12, "journal of clinical psychiatry": 11,
    "psychiatric services": 11, "neurotherapeutics": 11,
    "muscle nerve": 10, "epilepsia": 11, "epilepsy": 10,
    "journal of psychopharmacology": 10, "british journal of pharmacology": 10,
    "clinical pharmacology": 10, "drug alcohol depend": 9,
    # Cannabis-specific (peer-reviewed)
    "cannabis and cannabinoid research": 11, "journal of cannabis research": 10,
    # Good open access
    "pharmaceuticals": 9, "biomolecules": 9,
    "frontiers in psychiatry": 9, "frontiers in pharmacology": 9,
    "frontiers in neurology": 9, "frontiers": 8,
    "plos one": 8, "plos": 8,
    "journal of clinical medicine": 8, "bmc": 8,
    "international journal of molecular sciences": 8,
    "nutrients": 7, "molecules": 7, "mdpi": 7,
    # Cochrane
    "cochrane": 14,
}

RECENCY_SCORES = {0:15, 1:14, 2:12, 3:10, 4:8, 5:7, 6:5, 7:4, 8:3, 9:2, 10:2}

CBD_KEYWORDS = [
    "cannabidiol", "cbd", "balanced ratio", "1:1", "thc:cbd", "thc/cbd",
    "full spectrum", "full-spectrum", "whole plant", "nabiximols", "sativex",
    "endocannabinoid", "entourage", "terpene", "cbg", "cbn", "cbda", "thca",
]

CAUTION_KEYWORDS = [
    "dronabinol", "nabilone", "industry funded",
    "funded by the manufacturer", "sponsored by", "grant from",
]

# ═══════════════════════════════════════════
#  SHARED UTILITIES
# ═══════════════════════════════════════════

def fetch_url(url, retries=3, extra_headers=None):
    headers = {"User-Agent": "mostlyCBD-evidence-bot/1.2 (research; contact via mostlycbd.com)"}
    if extra_headers:
        headers.update(extra_headers)
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as r:
                return r.read().decode("utf-8")
        except Exception as e:
            if attempt == retries - 1:
                return None
            time.sleep(2 ** attempt)  # exponential backoff

def load_existing_ids():
    """All PMIDs and DOIs already in studies.json + pending.json."""
    ids = set()
    for fname in [STUDIES_FILE, PENDING_FILE]:
        if not os.path.exists(fname):
            continue
        with open(fname) as f:
            data = json.load(f)
        key = "studies" if "studies" in data else "pending"
        for s in data.get(key, []):
            if s.get("pubmed_id"):
                ids.add(f"pmid:{s['pubmed_id']}")
            if s.get("doi"):
                ids.add(f"doi:{s['doi'].lower()}")
    return ids

# ═══════════════════════════════════════════
#  SCORING ENGINE (shared by both sources)
# ═══════════════════════════════════════════

def score_entry(title, abstract, journal, pub_year, pubtype_list=None, citation_count=None):
    """
    Score 0–100. Returns (score, notes_string, study_type_slug).
    pubtype_list: list of strings from PubMed pubtype field (most reliable signal)
    citation_count: from OpenAlex (bonus signal)
    """
    score = 0
    notes = []
    full_text = (title + " " + abstract).lower()

    # ── 1. Study type ──────────────────────────────────────────────────────
    # Priority: PubMed pubtype tags > text scan
    best_type_pts  = 0
    best_type_name = "unknown"

    if pubtype_list:
        for pt in pubtype_list:
            pt_lower = pt.lower()
            for key, pts in PUBTYPE_SCORES.items():
                if key in pt_lower and pts > best_type_pts:
                    best_type_pts  = pts
                    best_type_name = key + " [pubtype]"

    # Text scan as fallback or supplement
    for phrase, pts in TEXT_TYPE_SCORES.items():
        if phrase in full_text and pts > best_type_pts:
            best_type_pts  = pts
            best_type_name = phrase + " [text]"

    # If we still have nothing useful and it's a journal article, give it the floor
    if best_type_pts == 0 and pubtype_list:
        if any("journal article" in pt.lower() for pt in pubtype_list):
            best_type_pts  = PUBTYPE_SCORES["journal article"]
            best_type_name = "journal article [pubtype]"

    score += best_type_pts
    notes.append(f"type:{best_type_name}(+{best_type_pts})")

    # ── 2. Journal ─────────────────────────────────────────────────────────
    journal_lower = journal.lower()
    journal_pts   = 8  # raised floor — unknown journals in cannabis field are still peer-reviewed
    for j, pts in JOURNAL_SCORES.items():
        if j in journal_lower:
            journal_pts = pts
            break
    score += journal_pts
    notes.append(f"journal:+{journal_pts}")

    # ── 3. Recency ─────────────────────────────────────────────────────────
    if pub_year:
        years_old = max(0, date.today().year - pub_year)
        rec_pts   = RECENCY_SCORES.get(years_old, 1)
        score    += rec_pts
        notes.append(f"year:{pub_year}(+{rec_pts})")

    # ── 4. CBD/cannabinoid relevance ───────────────────────────────────────
    cbd_hits = sum(1 for kw in CBD_KEYWORDS if kw in full_text)
    cbd_pts  = min(cbd_hits * 3, 18)  # slightly reduced per-hit to balance other signals
    score   += cbd_pts
    if cbd_pts:
        notes.append(f"cbd_relevance:{cbd_hits}hits(+{cbd_pts})")

    # ── 5. Sample size ─────────────────────────────────────────────────────
    sample_pts = 0
    for pattern in [
        r"n\s*=\s*(\d+)", r"(\d+)\s+patients", r"(\d+)\s+participants",
        r"(\d+)\s+subjects", r"(\d+)\s+(?:studies|trials|rcts|articles)",
    ]:
        m = re.search(pattern, abstract.lower())
        if m:
            n = int(m.group(1))
            if   n >= 5000: sample_pts = 15
            elif n >= 2000: sample_pts = 13
            elif n >= 1000: sample_pts = 11
            elif n >= 500:  sample_pts = 9
            elif n >= 200:  sample_pts = 7
            elif n >= 100:  sample_pts = 5
            elif n >= 50:   sample_pts = 3
            elif n >= 20:   sample_pts = 1
            break
    score += sample_pts
    if sample_pts:
        notes.append(f"sample(+{sample_pts})")

    # ── 6. Citation count bonus (OpenAlex) ────────────────────────────────
    if citation_count is not None:
        if   citation_count >= 500: cit_pts = 8
        elif citation_count >= 200: cit_pts = 6
        elif citation_count >= 100: cit_pts = 5
        elif citation_count >= 50:  cit_pts = 3
        elif citation_count >= 20:  cit_pts = 2
        elif citation_count >= 5:   cit_pts = 1
        else:                       cit_pts = 0
        score += cit_pts
        if cit_pts:
            notes.append(f"citations:{citation_count}(+{cit_pts})")

    # ── 7. Caution deductions ──────────────────────────────────────────────
    caution_hits = sum(1 for kw in CAUTION_KEYWORDS if kw in full_text)
    caution_ded  = caution_hits * 3
    score       -= caution_ded
    if caution_ded:
        notes.append(f"caution:-{caution_ded}")

    score = max(0, min(100, score))

    # Derive clean study type slug for the JSON field
    slug_map = {
        "meta-analysis": "meta_analysis", "meta analysis": "meta_analysis",
        "cochrane": "meta_analysis",
        "systematic review": "systematic_review",
        "randomized controlled trial": "rct", "randomised controlled trial": "rct",
        "rct": "rct", "double-blind": "rct", "placebo-controlled": "rct",
        "randomized": "rct", "randomised": "rct",
        "phase iii": "clinical_trial", "phase 3": "clinical_trial",
        "phase ii": "clinical_trial", "phase 2": "clinical_trial",
        "clinical trial": "clinical_trial", "open-label": "clinical_trial",
        "observational": "observational", "cohort": "observational",
        "case series": "observational", "case-control": "observational",
        "preclinical": "preclinical", "animal model": "preclinical",
        "in vivo": "preclinical", "in vitro": "preclinical",
        "review": "review",
    }
    type_slug = "review"
    for k, v in slug_map.items():
        if k in best_type_name.lower():
            type_slug = v
            break

    return score, " | ".join(notes), type_slug


def infer_finding(abstract):
    text = abstract.lower()
    pos = sum(1 for s in [
        "significant improvement", "significantly reduced", "significant reduction",
        "significant decrease", "significantly improved", "beneficial effect",
        "effective", "efficacious", "demonstrated benefit", "reduced pain",
        "reduced anxiety", "improved sleep", "positive outcome", "promising",
        "potential treatment", "may be useful", "therapeutic benefit",
        "clinically meaningful", "statistically significant", "significant analgesic",
    ] if s in text)
    neg = sum(1 for s in [
        "no significant", "no statistically significant", "no benefit",
        "not effective", "not significantly", "worsened", "failed to",
        "did not improve", "no improvement", "no difference between",
        "insufficient evidence", "negative result", "did not reduce",
        "no effect on", "no reduction in",
    ] if s in text)
    if pos > 0 and neg == 0: return "positive"
    if neg > 0 and pos == 0: return "negative"
    return "mixed"


def infer_tags(title, abstract):
    text = (title + " " + abstract).lower()
    tag_map = {
        "pain":          ["pain", "analgesic", "nocicepti"],
        "neuropathy":    ["neuropath", "allodynia", "hyperalgesia"],
        "anxiety":       ["anxiety", "anxiolytic", "generalized anxiety"],
        "ptsd":          ["ptsd", "post-traumatic", "posttraumatic"],
        "sleep":         ["sleep", "insomnia"],
        "epilepsy":      ["epilepsy", "seizure", "anticonvulsant", "dravet"],
        "inflammation":  ["inflamm", "anti-inflamm", "cytokine", "neuroinflammation"],
        "depression":    ["depress", "antidepressant"],
        "cancer":        ["cancer", "oncolog", "tumor", "chemotherap", "palliative"],
        "ms":            ["multiple sclerosis", "spasticity"],
        "als":           ["amyotrophic", " als ", "motor neuron disease"],
        "fibromyalgia":  ["fibromyalgia"],
        "ibd":           ["inflammatory bowel", "crohn", "colitis"],
        "parkinson":     ["parkinson"],
        "autism":        ["autism", " asd "],
        "opioid":        ["opioid", "opiate", "opioid sparing"],
        "cbd-only":      ["cannabidiol", " cbd "],
        "thc":           ["tetrahydrocannabinol", "delta-9", " thc "],
        "balanced":      ["1:1", "balanced", "nabiximols", "sativex", "thc:cbd"],
        "full-spectrum": ["full spectrum", "full-spectrum", "whole plant", "entourage"],
        "mechanism":     ["mechanism", "receptor", "cb1", "cb2", "5-ht1a", "trpv"],
        "safety":        ["safety", "adverse", "tolerab", "side effect"],
        "ecs":           ["endocannabinoid"],
        "preclinical":   ["mouse", "rat", "murine", "animal model", "in vitro"],
        "dosing":        ["dose", "dosing", "dosage", "titration"],
        "meta-analysis": ["meta-analysis", "meta analysis"],
        "rct":           ["randomized controlled", "randomised controlled", "double-blind"],
    }
    return [tag for tag, kws in tag_map.items() if any(kw in text for kw in kws)][:10]


def infer_cannabinoids(text):
    text = text.lower()
    found = []
    if "cannabidiol" in text or " cbd " in text:          found.append("cbd")
    if "tetrahydrocannabinol" in text or " thc " in text: found.append("thc")
    if "1:1" in text or "nabiximols" in text or "sativex" in text: found.append("balanced")
    if "full spectrum" in text or "whole plant" in text:  found.append("full-spectrum")
    if "cannabigerol" in text or " cbg " in text:         found.append("cbg")
    return found or ["cannabinoids"]


def infer_conditions(tags):
    cmap = {
        "pain":"chronic-pain","neuropathy":"neuropathic-pain","anxiety":"anxiety",
        "ptsd":"ptsd","sleep":"sleep","epilepsy":"epilepsy","inflammation":"inflammation",
        "depression":"depression","cancer":"cancer-related","ms":"ms","als":"als",
        "fibromyalgia":"fibromyalgia","ibd":"ibd","parkinson":"parkinson",
        "autism":"autism","opioid":"opioid-related",
    }
    return [cmap[t] for t in tags if t in cmap]


def infer_audience(type_slug, score):
    if type_slug in ("meta_analysis", "systematic_review"):
        return ["patient", "provider", "researcher"]
    if type_slug in ("rct", "clinical_trial"):
        aud = ["provider", "researcher"]
        if score >= 65: aud.insert(0, "patient")
        return aud
    if type_slug == "observational":
        return ["patient", "provider"]
    if type_slug == "preclinical":
        return ["researcher"]
    return ["patient", "provider", "researcher"]


def clean_abstract(text):
    if not text:
        return ""
    # Strip author/affiliation blocks PubMed appends after abstract
    text = re.sub(r"Author information:.*", "", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"\(\)[\w\s,]+(?:University|Institute|Department|Hospital|School|Center|Centre|College|Faculty|Laboratory|Lab|Clinic)[^\n]*", "", text, flags=re.IGNORECASE)
    # Strip leading author name lists: "Smith J(), Jones A()..."
    text = re.sub(r"^(?:[A-Z][a-z\-]* [A-Z]{1,4}\(\)[()]*,?\s*){2,}", "", text.strip())
    # Strip section-header labels
    text = re.sub(r"\b(BACKGROUND|OBJECTIVE[S]?|PURPOSE|METHODS?|RESULTS?|CONCLUSIONS?|INTRODUCTION|SIGNIFICANCE|AIM[S]?|DESIGN|SETTING|PARTICIPANTS?|INTERVENTION[S]?|MAIN OUTCOME[S]?|FINDINGS?):\s*", "", text, flags=re.IGNORECASE)
    # Strip citation artifacts
    text = re.sub(r"\[?\d+\]?", "", text)
    text = re.sub(r"(PMID|doi|DOI|PMCID):[\s\S]{0,80}", "", text)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"\s{2,}", " ", text).strip()

    raw_sentences = re.split(r"(?<=[.!?])\s+", text)
    clean = []
    fragment_starters = ("and ","or ","but ","for ","nor ","so ","yet ",
                         "the ","a ","an ","in ","of ","to ","with ","by ",
                         "on ","at ","from ","as ","is ","was ","are ","were ",
                         "ids ","tion ","ing ","ed ","ion ","nts ","ces ")
    for s in raw_sentences:
        s = s.strip()
        if len(s) < 40:
            continue
        # Skip author/affiliation noise
        if s.count("()") / max(len(s.split()), 1) > 0.15:
            continue
        if re.match(r"^[a-z]", s):
            if any(s.startswith(w) for w in fragment_starters):
                continue
            s = s[0].upper() + s[1:]
        clean.append(s)
        if len(clean) == 3:
            break

    if not clean:
        return ""
    summary = " ".join(clean)
    if len(summary) > 520:
        summary = summary[:520].rsplit(" ", 1)[0] + "..."
    return summary


def extract_sample_size(abstract):
    for p in [r"n\s*=\s*(\d+)", r"(\d+)\s+patients", r"(\d+)\s+participants",
              r"(\d+)\s+subjects", r"(\d+)\s+(?:studies|trials|rcts)"]:
        m = re.search(p, abstract.lower())
        if m:
            num = int(m.group(1))   # strips leading zeros
            return f"N={num}"
    return "See source"


# ═══════════════════════════════════════════
#  PUBMED SOURCE
# ═══════════════════════════════════════════

PUBMED_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"

def pm_url(endpoint, params):
    if PUBMED_API_KEY:
        params["api_key"] = PUBMED_API_KEY
    return PUBMED_BASE + endpoint + "?" + urllib.parse.urlencode(params)

def pubmed_search(query, n=15):
    params = {"db":"pubmed","term":query,"retmax":n,"retmode":"json","sort":PUBMED_SORT}
    if LOOKBACK_DAYS > 0:
        cutoff = (date.today() - timedelta(days=LOOKBACK_DAYS)).strftime("%Y/%m/%d")
        params.update({"datetype":"edat","mindate":cutoff,"maxdate":date.today().strftime("%Y/%m/%d")})
    raw = fetch_url(pm_url("esearch.fcgi", params))
    if not raw: return []
    try:
        return json.loads(raw).get("esearchresult", {}).get("idlist", [])
    except: return []

def pubmed_details(pmids):
    if not pmids: return []
    raw = fetch_url(pm_url("esummary.fcgi", {"db":"pubmed","id":",".join(pmids),"retmode":"json"}))
    if not raw: return []
    try:
        result = json.loads(raw).get("result", {})
        return [result[uid] for uid in result.get("uids", []) if uid in result]
    except: return []

def pubmed_abstract(pmid):
    raw = fetch_url(pm_url("efetch.fcgi", {"db":"pubmed","id":pmid,"retmode":"text","rettype":"abstract"}))
    return raw.strip() if raw else ""

def pubmed_to_entry(details, abstract, idx, existing_ids):
    pmid = str(details.get("uid", ""))
    uid  = f"pmid:{pmid}"
    if uid in existing_ids: return None

    title   = details.get("title", "").strip().rstrip(".")
    journal = details.get("source", "")
    authors = ", ".join(a.get("name","") for a in details.get("authors",[])[:3])
    if len(details.get("authors",[])) > 3: authors += " et al."

    ym = re.search(r"(\d{4})", details.get("pubdate",""))
    year = int(ym.group(1)) if ym else None

    raw_pt   = details.get("pubtype", [])
    pubtypes = [pt.get("value","") if isinstance(pt, dict) else str(pt) for pt in raw_pt]
    score, score_notes, type_slug = score_entry(title, abstract, journal, year, pubtypes)

    tags    = infer_tags(title, abstract)
    return {
        "id":           f"p{idx:04d}",
        "source":       "pubmed",
        "title":        title,
        "authors":      authors,
        "journal":      journal,
        "year":         year,
        "study_type":   type_slug,
        "url":          f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
        "pubmed_id":    pmid,
        "doi":          None,
        "plain_summary":clean_abstract(abstract),
        "finding":      infer_finding(abstract),
        "tags":         tags,
        "conditions":   infer_conditions(tags),
        "cannabinoids": infer_cannabinoids(title + " " + abstract),
        "audience":     infer_audience(type_slug, score),
        "sample_size":  extract_sample_size(abstract),
        "score":        score,
        "score_notes":  score_notes,
        "approved":     False,
    }

def run_pubmed(existing_ids):
    print("\n  📗 PubMed")
    all_pmids = set()
    for i, topic in enumerate(PUBMED_TOPICS):
        print(f"    [{i+1:02d}/{len(PUBMED_TOPICS)}] {topic[:65]}...")
        pmids = pubmed_search(topic, RESULTS_PER_QUERY)
        new   = [p for p in pmids if f"pmid:{p}" not in existing_ids]
        all_pmids.update(new)
        print(f"           → {len(pmids)} results, {len(new)} new")
        time.sleep(0.4)

    print(f"\n    Fetching details for {len(all_pmids)} unique new PMIDs...")
    pmid_list = list(all_pmids)
    details_list = []
    for i in range(0, len(pmid_list), 20):
        details_list.extend(pubmed_details(pmid_list[i:i+20]))
        time.sleep(0.3)

    entries = []
    for i, det in enumerate(details_list):
        pmid     = str(det.get("uid",""))
        abstract = pubmed_abstract(pmid)
        time.sleep(0.35)
        entry = pubmed_to_entry(det, abstract, 1000+i, existing_ids)
        if entry:
            entries.append(entry)
            existing_ids.add(f"pmid:{pmid}")

    print(f"    → {len(entries)} candidates from PubMed")
    return entries


# ═══════════════════════════════════════════
#  OPENALEX SOURCE
# ═══════════════════════════════════════════

OPENALEX_BASE = "https://api.openalex.org"

def oa_url(path, params):
    if OPENALEX_EMAIL:
        params["mailto"] = OPENALEX_EMAIL
    return OPENALEX_BASE + path + "?" + urllib.parse.urlencode(params)

def openalex_search(query, n=15):
    """Search OpenAlex works, return list of work dicts."""
    cutoff_year = date.today().year - (LOOKBACK_DAYS // 365) if LOOKBACK_DAYS > 0 else 2000
    params = {
        "search": query,
        "per-page": n,
        "sort": "publication_date:desc",
        "filter": f"publication_year:>{cutoff_year},type:article",
        "select": "id,title,authorships,primary_location,publication_year,doi,abstract_inverted_index,cited_by_count,type",
    }
    raw = fetch_url(oa_url("/works", params))
    if not raw: return []
    try:
        return json.loads(raw).get("results", [])
    except: return []

def reconstruct_abstract(inverted_index):
    """OpenAlex stores abstracts as inverted index {word: [positions]}. Reconstruct."""
    if not inverted_index:
        return ""
    word_pos = []
    for word, positions in inverted_index.items():
        for pos in positions:
            word_pos.append((pos, word))
    word_pos.sort(key=lambda x: x[0])
    return " ".join(w for _, w in word_pos)

def openalex_to_entry(work, idx, existing_ids):
    doi = (work.get("doi") or "").lower().replace("https://doi.org/", "").strip()
    uid_doi  = f"doi:{doi}" if doi else None
    oa_id    = work.get("id","").split("/")[-1]  # e.g. W2145523256
    uid_oa   = f"oa:{oa_id}"

    # Skip if we already have this DOI
    if uid_doi and uid_doi in existing_ids: return None
    if uid_oa  in existing_ids: return None

    title = (work.get("title") or "").strip().rstrip(".")
    if not title: return None

    # Journal / venue
    loc     = work.get("primary_location") or {}
    source  = loc.get("source") or {}
    journal = source.get("display_name") or ""

    # Authors
    auths = work.get("authorships", [])[:3]
    author_names = []
    for a in auths:
        name = (a.get("author") or {}).get("display_name","")
        if name: author_names.append(name)
    authors = ", ".join(author_names)
    if len(work.get("authorships",[])) > 3: authors += " et al."

    year     = work.get("publication_year")
    cit      = work.get("cited_by_count", 0)
    abstract = reconstruct_abstract(work.get("abstract_inverted_index"))

    score, score_notes, type_slug = score_entry(
        title, abstract, journal, year,
        pubtype_list=None,          # OpenAlex doesn't have pubtype tags
        citation_count=cit,
    )
    tags = infer_tags(title, abstract)

    url = f"https://doi.org/{doi}" if doi else f"https://openalex.org/{oa_id}"

    entry = {
        "id":           f"o{idx:04d}",
        "source":       "openalex",
        "title":        title,
        "authors":      authors,
        "journal":      journal,
        "year":         year,
        "study_type":   type_slug,
        "url":          url,
        "pubmed_id":    None,
        "doi":          doi or None,
        "plain_summary":clean_abstract(abstract),
        "finding":      infer_finding(abstract),
        "tags":         tags,
        "conditions":   infer_conditions(tags),
        "cannabinoids": infer_cannabinoids(title + " " + abstract),
        "audience":     infer_audience(type_slug, score),
        "sample_size":  extract_sample_size(abstract),
        "score":        score,
        "score_notes":  score_notes,
        "approved":     False,
    }
    # Register both DOI and OA id to prevent future dupes
    if uid_doi: existing_ids.add(uid_doi)
    existing_ids.add(uid_oa)
    return entry

def run_openalex(existing_ids):
    print("\n  📘 OpenAlex")
    entries = []
    for i, topic in enumerate(OPENALEX_TOPICS):
        print(f"    [{i+1:02d}/{len(OPENALEX_TOPICS)}] {topic[:65]}...")
        works = openalex_search(topic, RESULTS_PER_QUERY)
        new_count = 0
        for work in works:
            entry = openalex_to_entry(work, 3000+len(entries), existing_ids)
            if entry:
                entries.append(entry)
                new_count += 1
        print(f"           → {len(works)} results, {new_count} new")
        time.sleep(0.2)  # OpenAlex polite pool is generous
    print(f"    → {len(entries)} candidates from OpenAlex")
    return entries


# ═══════════════════════════════════════════
#  MAIN PIPELINE
# ═══════════════════════════════════════════

def dedupe(entries):
    """Remove duplicate titles across sources (fuzzy: lowercase, strip punctuation)."""
    seen = set()
    out  = []
    for e in entries:
        key = re.sub(r"[^a-z0-9]","", e["title"].lower())[:80]
        if key not in seen:
            seen.add(key)
            out.append(e)
    return out

def run_pipeline(debug=False, source_filter=None):
    threshold = 0 if debug else THRESHOLD
    print("\n🌿 mostlyCBD Evidence Pipeline v1.2")
    print("=" * 55)
    print(f"  Sources:    PubMed + OpenAlex" if not source_filter else f"  Source:     {source_filter}")
    print(f"  Lookback:   {LOOKBACK_DAYS} days")
    print(f"  Threshold:  {threshold}" + (" [DEBUG — all results]" if debug else ""))
    print("=" * 55)

    existing_ids = load_existing_ids()
    print(f"\n  Already tracked: {len(existing_ids)} entries\n")

    all_entries = []

    if not source_filter or source_filter == "pubmed":
        all_entries.extend(run_pubmed(existing_ids))

    if not source_filter or source_filter == "openalex":
        all_entries.extend(run_openalex(existing_ids))

    all_entries = dedupe(all_entries)
    all_entries.sort(key=lambda x: -x["score"])

    above = [e for e in all_entries if e["score"] >= threshold]
    below = [e for e in all_entries if e["score"] <  threshold]

    print(f"\n  ─────────────────────────────────────────")
    print(f"  Total candidates (deduped):  {len(all_entries)}")
    print(f"  ✓ Above threshold ({threshold}):       {len(above)}")
    print(f"  ✗ Below threshold:           {len(below)}")

    if debug and below:
        print(f"\n  Below-threshold results:")
        for e in below:
            print(f"    [{e['score']:3d}] {e['source']:9s} {e['title'][:65]}...")
            print(f"         {e['score_notes'][:100]}")

    if not above:
        print("\n  No candidates above threshold.")
        if not debug:
            print("  Run with --debug to diagnose scores.")
        return

    pending = {
        "meta": {
            "generated":        datetime.now().isoformat(),
            "pipeline_version": "1.2",
            "threshold_used":   threshold,
            "total_pending":    len(above),
            "instructions":     (
                "Review each entry. Edit plain_summary to match your voice. "
                "Set 'approved': true to publish. "
                "Run: python build_evidence.py --approve"
            ),
        },
        "pending": above,
    }
    with open(PENDING_FILE, "w") as f:
        json.dump(pending, f, indent=2)

    print(f"\n  ✅ {len(above)} candidates written to {PENDING_FILE}")
    print(f"\n  Next:")
    print(f"  1. Open pending.json (sorted by score, highest first)")
    print(f"  2. Edit plain_summary to match your voice")
    print(f"  3. Set \"approved\": true on entries you want")
    print(f"  4. python build_evidence.py --approve")
    print()

def sanitize_text(value):
    """Fix encoding artifacts before writing to studies.json.
    Handles mojibake (UTF-8 bytes misread as Latin-1) and maps
    Unicode typographic characters to safe HTML entities."""
    if not isinstance(value, str):
        return value
    # Mojibake: UTF-8 multi-byte sequences misread as Latin-1
    mojibake = [
        ("\u00e2\u20ac\u201d", "&mdash;"),
        ("\u00e2\u20ac\u0153", "&ldquo;"),
        ("\u00e2\u20ac\u009d", "&rdquo;"),
        ("\u00e2\u20ac\u02dc", "&lsquo;"),
        ("\u00e2\u20ac\u2122", "&rsquo;"),
        ("\u00e2\u20ac\u00a6", "&hellip;"),
        ("\u00e2\u20ac\u201c", "&ndash;"),
    ]
    for bad, good in mojibake:
        value = value.replace(bad, good)
    # Unicode typographic chars -> HTML entities
    replacements = [
        ("\u2014", "&mdash;"),
        ("\u2013", "&ndash;"),
        ("\u2018", "&lsquo;"),
        ("\u2019", "&rsquo;"),
        ("\u201c", "&ldquo;"),
        ("\u201d", "&rdquo;"),
        ("\u2026", "&hellip;"),
        ("\u00a0", " "),
    ]
    for char, entity in replacements:
        value = value.replace(char, entity)
    return value

def sanitize_entry(entry):
    """Recursively sanitize all string values in an entry dict."""
    return {k: sanitize_text(v) if isinstance(v, str) else v for k, v in entry.items()}

def run_approve():
    if not os.path.exists(PENDING_FILE):
        print(f"  \u26a0 {PENDING_FILE} not found. Run pipeline first.")
        return
    with open(PENDING_FILE) as f:
        pending_data = json.load(f)
    approved = [e for e in pending_data.get("pending",[]) if e.get("approved")]
    if not approved:
        print("  \u26a0 No entries marked approved. Set \"approved\": true and re-run.")
        return
    library = {"meta":{},"studies":[]}
    if os.path.exists(STUDIES_FILE):
        with open(STUDIES_FILE) as f:
            library = json.load(f)
    known = set()
    for s in library["studies"]:
        if s.get("pubmed_id"): known.add(f"pmid:{s['pubmed_id']}")
        if s.get("doi"):       known.add(f"doi:{s['doi'].lower()}")
    added = 0
    for entry in approved:
        pmid_key = f"pmid:{entry.get('pubmed_id')}" if entry.get("pubmed_id") else None
        doi_key  = f"doi:{entry.get('doi','').lower()}" if entry.get("doi") else None
        if (pmid_key and pmid_key in known) or (doi_key and doi_key in known):
            continue
        entry["id"] = f"s{len(library['studies'])+1:03d}"
        library["studies"].append(sanitize_entry(entry))
        if pmid_key: known.add(pmid_key)
        if doi_key:  known.add(doi_key)
        added += 1
    library["meta"]["last_updated"]  = date.today().isoformat()
    library["meta"]["total_entries"] = len(library["studies"])
    with open(STUDIES_FILE, "w") as f:
        json.dump(library, f, indent=2, ensure_ascii=False)
    print(f"\n  \u2705 Added {added} entries. Library total: {library['meta']['total_entries']}")
    print(f"  Commit and push studies.json to publish.")

def run_stats():
    if not os.path.exists(STUDIES_FILE):
        print(f"  ⚠ {STUDIES_FILE} not found.")
        return
    with open(STUDIES_FILE) as f:
        data = json.load(f)
    studies = [s for s in data.get("studies",[]) if s.get("approved")]
    findings = {}; types = {}; conds = {}; scores = []; sources = {}
    for s in studies:
        findings[s.get("finding","mixed")] = findings.get(s.get("finding","mixed"),0)+1
        types[s.get("study_type","?")] = types.get(s.get("study_type","?"),0)+1
        scores.append(s.get("score",0))
        src = s.get("source","manual")
        sources[src] = sources.get(src,0)+1
        for c in s.get("conditions",[]):
            conds[c] = conds.get(c,0)+1
    print(f"\n🌿 Evidence Library Stats")
    print(f"  Total:    {len(studies)}")
    if scores: print(f"  Avg score:{sum(scores)/len(scores):.1f}")
    print(f"  Sources:  {sources}")
    print(f"  Findings: {findings}")
    print(f"  Types:    {dict(sorted(types.items(),key=lambda x:-x[1]))}")
    print(f"  Top conditions: {dict(list(sorted(conds.items(),key=lambda x:-x[1]))[:8])}")
    print()

# ═══════════════════════════════════════════
#  ENTRY POINT
# ═══════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="mostlyCBD Evidence Pipeline")
    parser.add_argument("--approve",action="store_true",help="Merge approved pending.json → studies.json")
    parser.add_argument("--stats",  action="store_true",help="Print library stats")
    parser.add_argument("--debug",  action="store_true",help="Show ALL scored results, ignore threshold")
    parser.add_argument("--source", choices=["pubmed","openalex"], default=None,
                        help="Run only one source (default: both)")
    args = parser.parse_args()

    if args.approve: run_approve()
    elif args.stats: run_stats()
    else:            run_pipeline(debug=args.debug, source_filter=args.source)
