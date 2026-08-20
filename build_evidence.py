
Cloud
/












































Build evidence · PY
#!/usr/bin/env python3
"""
build_evidence.py — mostlyCBD Evidence Library Pipeline v2.0
=============================================================
Queries PubMed (+ optionally OpenAlex) for cannabis/cannabinoid research
and sorts it into two buckets:
 
  1. studies.json — auto-published. A study lands here because it clears
     objective, checkable criteria: PubMed-indexed (real peer review),
     a recognized clinical evidence-hierarchy publication type, on-topic,
     and not retracted. No score, no keyword bonus for matching site
     editorial positions, no personal sign-off required.
 
  2. pending.json — outliers only. Genuinely ambiguous cases: weak/unclear
     topical relevance, lower evidence tiers (case reports, preclinical,
     small observational studies) that deserve a human glance, or anything
     flagged during retraction/integrity checks that needs a second look
     rather than a silent auto-exclude.
 
WHY v2.0 EXISTS
---------------
v1.2 scored every candidate with a hand-built point system that included:
  - bonus points for using CBD/full-spectrum/entourage language (rewarded
    matching the site's own editorial thesis, not study rigor)
  - point deductions for "industry funded" or for THC-dominant/synthetic
    drugs like dronabinol/nabilone (conflated funding source and drug
    type with quality)
  - a hardcoded "elite journal" allowlist
  - whole-abstract keyword counting to label a study positive/negative/mixed
That scoring system is gone. Inclusion is now a small set of named,
checkable criteria — see AUTO_PUBLISH_TYPES and classify_tier() below —
not a hidden weighted score.
 
Usage:
    python build_evidence.py              # Full pipeline → studies.json + pending.json
    python build_evidence.py --approve    # Merge human-approved pending.json entries → studies.json
    python build_evidence.py --stats      # Library stats
    python build_evidence.py --source pubmed    # PubMed only (default; OpenAlex is supplementary)
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
 
PUBMED_API_KEY   = "253cf9dde891b23bda684b0e8f581cd10609"          # Free: ncbi.nlm.nih.gov/account/ — raises rate limit 3→10 req/s
OPENALEX_EMAIL   = ""          # Optional but polite: puts you in OpenAlex's "polite pool"
STUDIES_FILE     = "studies.json"
PENDING_FILE     = "pending.json"      # outliers needing a human glance — NOT a full review queue
RESULTS_PER_QUERY = 25         # Per query per source
LOOKBACK_DAYS    = 3650        # 10yr backfill first run; set 90 for quarterly, 30 for monthly
PUBMED_SORT      = "relevance" # "relevance" surfaces the best matches; use "date" for pure recency runs
 
# ── Search topics ───────────────────────────────────────────────────────
# Each topic already restricts to a recognized clinical evidence-hierarchy
# publication type IN THE QUERY ITSELF (see PUBTYPE_FILTER below), so the
# candidate pool arriving from PubMed is pre-filtered to reputable study
# designs rather than being scored/filtered after the fact.
PUBTYPE_FILTER = (
    '("systematic review"[pt] OR "meta-analysis"[pt] OR "randomized controlled trial"[pt] '
    'OR "clinical trial"[pt] OR "clinical trial, phase ii"[pt] OR "clinical trial, phase iii"[pt] '
    'OR "clinical trial, phase iv"[pt])'
)
 
PUBMED_TOPICS = [
    f'(cannabidiol OR cannabinoids) AND ("chronic pain"[MeSH Terms] OR "neuropathic pain"[MeSH Terms] OR pain[MeSH Terms]) AND {PUBTYPE_FILTER}',
    f'(cannabidiol OR cannabinoids OR cannabis) AND ("anxiety"[MeSH Terms] OR "anxiety disorders"[MeSH Terms] OR PTSD OR "depression"[MeSH Terms]) AND {PUBTYPE_FILTER}',
    f'(cannabidiol OR cannabinoids) AND ("sleep"[MeSH Terms] OR insomnia) AND {PUBTYPE_FILTER}',
    f'(cannabidiol OR cannabinoids) AND ("epilepsy"[MeSH Terms] OR "seizures"[MeSH Terms]) AND {PUBTYPE_FILTER}',
    f'cannabinoids AND ("multiple sclerosis"[MeSH Terms] OR spasticity) AND {PUBTYPE_FILTER}',
    f'cannabinoids AND ("neoplasms"[MeSH Terms] OR "palliative care"[MeSH Terms] OR chemotherapy) AND {PUBTYPE_FILTER}',
    f'cannabidiol AND ("inflammation"[MeSH Terms] OR "inflammatory bowel diseases"[MeSH Terms] OR autoimmune) AND {PUBTYPE_FILTER}',
    f'cannabidiol AND ("opioid-related disorders"[MeSH Terms] OR "substance-related disorders"[MeSH Terms] OR addiction) AND {PUBTYPE_FILTER}',
    f'cannabidiol AND "autism spectrum disorder"[MeSH Terms] AND {PUBTYPE_FILTER}',
    f'cannabinoids AND ("amyotrophic lateral sclerosis"[MeSH Terms] OR "parkinson disease"[MeSH Terms] OR neurodegeneration) AND {PUBTYPE_FILTER}',
    f'cannabinoids AND (fibromyalgia OR "arthritis"[MeSH Terms]) AND {PUBTYPE_FILTER}',
    f'cannabidiol AND (safety[Title/Abstract] OR "adverse events"[Title/Abstract] OR "drug interactions"[MeSH Terms]) AND {PUBTYPE_FILTER}',
]
 
# ── OpenAlex search queries (supplementary — currently optional/off by default) ──
OPENALEX_TOPICS = [
    "cannabidiol chronic pain systematic review",
    "cannabidiol anxiety disorder randomized trial",
    "cannabidiol sleep insomnia clinical trial",
    "cannabidiol epilepsy seizure randomized",
    "cannabinoids multiple sclerosis spasticity trial",
    "cannabinoids cancer pain palliative trial",
    "cannabidiol inflammatory bowel disease trial",
    "cannabidiol opioid use disorder trial",
    "cannabidiol autism spectrum disorder trial",
    "cannabis Parkinson ALS neurodegeneration trial",
    "cannabinoids fibromyalgia arthritis trial",
    "cannabidiol safety adverse events clinical",
]
 
# ═══════════════════════════════════════════
#  EVIDENCE TIER — replaces the old point score
# ═══════════════════════════════════════════
# This is a named, standard clinical evidence hierarchy (the same ordering
# used in GRADE / Oxford CEBM), not a bespoke weighting formula. A study's
# tier comes straight from PubMed's own publication-type classification —
# not from whether its language matches this site's editorial stance.
 
TIER_ORDER = [
    "meta_analysis",       # meta-analyses, Cochrane reviews
    "systematic_review",   # systematic reviews
    "rct",                 # randomized controlled trials
    "clinical_trial",      # phase II/III/IV or general clinical trials
    "observational",       # cohort, case-control, registry studies
    "case_report",         # case reports / case series
    "preclinical",         # animal models, in vitro
    "review",              # narrative reviews (not systematic)
    "unknown",
]
 
# Tiers that auto-publish without a manual gate, PROVIDED the study is
# on-topic and not retracted. Everything else is an "outlier" — not
# excluded, just routed to pending.json for a human glance.
AUTO_PUBLISH_TIERS = {"meta_analysis", "systematic_review", "rct", "clinical_trial"}
 
PUBTYPE_TIER_MAP = {
    "meta-analysis":               "meta_analysis",
    "systematic review":           "systematic_review",
    "randomized controlled trial": "rct",
    "clinical trial, phase iv":    "clinical_trial",
    "clinical trial, phase iii":   "clinical_trial",
    "clinical trial, phase ii":    "clinical_trial",
    "clinical trial":              "clinical_trial",
    "observational study":         "observational",
    "case reports":                "case_report",
    "review":                      "review",
    "retracted publication":       "RETRACTED",   # hard-exclude signal, handled separately
}
 
TEXT_TIER_HINTS = [
    # Order matters — first match wins. Used only when PubMed pubtype
    # tags are absent or uninformative (e.g. OpenAlex results).
    ("cochrane review", "meta_analysis"),
    ("meta-analysis", "meta_analysis"), ("meta analysis", "meta_analysis"),
    ("systematic review", "systematic_review"),
    ("randomized controlled trial", "rct"), ("randomised controlled trial", "rct"),
    ("double-blind, placebo-controlled", "rct"), ("double blind placebo controlled", "rct"),
    ("phase iii", "clinical_trial"), ("phase 3", "clinical_trial"),
    ("phase ii", "clinical_trial"), ("phase 2", "clinical_trial"),
    ("open-label", "clinical_trial"), ("open label trial", "clinical_trial"),
    ("clinical trial", "clinical_trial"),
    ("retrospective cohort", "observational"), ("prospective cohort", "observational"),
    ("cohort study", "observational"), ("case-control", "observational"),
    ("case series", "case_report"), ("case report", "case_report"),
    ("in vivo", "preclinical"), ("in vitro", "preclinical"),
    ("animal model", "preclinical"), ("murine", "preclinical"), ("mouse model", "preclinical"),
    ("narrative review", "review"), ("review", "review"),
]
 
# Minimum topical relevance: at least one of these must appear in title+abstract.
# Not a scoring signal — a binary on-topic guard so loosely-matched MeSH hits
# get routed to manual review instead of silently auto-publishing.
CORE_TOPIC_TERMS = [
    "cannabidiol", "cannabinoid", "cannabis", " cbd ", " thc ",
    "endocannabinoid", "tetrahydrocannabinol", "nabiximols", "sativex",
]
 
CBD_KEYWORDS = [  # tagging only — does NOT affect inclusion or tier
    "cannabidiol", "cbd", "balanced ratio", "1:1", "thc:cbd", "thc/cbd",
    "full spectrum", "full-spectrum", "whole plant", "nabiximols", "sativex",
    "endocannabinoid", "entourage", "terpene", "cbg", "cbn", "cbda", "thca",
]
 
# ═══════════════════════════════════════════
#  SHARED UTILITIES
# ═══════════════════════════════════════════
 
def fetch_url(url, retries=3, extra_headers=None):
    headers = {"User-Agent": "mostlyCBD-evidence-bot/2.0 (research; contact via mostlycbd.com)"}
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
        with open(fname, encoding="utf-8") as f:
            data = json.load(f)
        key = "studies" if "studies" in data else "pending"
        for s in data.get(key, []):
            if s.get("pubmed_id"):
                ids.add(f"pmid:{s['pubmed_id']}")
            if s.get("doi"):
                ids.add(f"doi:{s['doi'].lower()}")
    return ids
 
# ═══════════════════════════════════════════
#  TIER CLASSIFICATION (replaces score_entry)
# ═══════════════════════════════════════════
 
def classify_tier(title, abstract, pubtype_list=None):
    """
    Returns (tier_slug, tier_source) where tier_source is 'pubtype' (most
    reliable — PubMed's own classification) or 'text' (fallback heuristic,
    used for OpenAlex results that carry no pubtype tags).
    tier_slug of 'RETRACTED' means: exclude, don't publish, log it.
    """
    full_text = (title + " " + abstract).lower()
 
    if pubtype_list:
        for pt in pubtype_list:
            pt_lower = pt.lower()
            for key, tier in PUBTYPE_TIER_MAP.items():
                if key in pt_lower:
                    return tier, "pubtype"
 
    for phrase, tier in TEXT_TIER_HINTS:
        if phrase in full_text:
            return tier, "text"
 
    return "unknown", "text"
 
 
def is_on_topic(title, abstract):
    full_text = (title + " " + abstract).lower()
    return any(term in full_text for term in CORE_TOPIC_TERMS)
 
 
def extract_conclusion(abstract):
    """
    Pull the CONCLUSIONS/INTERPRETATION section of a structured abstract
    specifically, instead of grabbing the first few sentences (which are
    usually background/methods). Falls back to the last portion of the
    abstract if no structured section is found.
    """
    if not abstract:
        return ""
    text = re.sub(r"Author information:.*", "", abstract, flags=re.IGNORECASE | re.DOTALL)
 
    m = re.search(
        r"(?:CONCLUSIONS?|INTERPRETATION|CLINICAL\s+(?:IMPLICATIONS|RELEVANCE))[S]?:?\s*(.+?)"
        r"(?:\n\n|(?:BACKGROUND|OBJECTIVE|METHODS?|RESULTS?|PMID|DOI):|$)",
        text, flags=re.IGNORECASE | re.DOTALL,
    )
    if m:
        section = m.group(1).strip()
    else:
        # No structured section — use the back half of the abstract, which
        # is where conclusions conventionally land in unstructured abstracts.
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        section = " ".join(sentences[max(0, len(sentences) - 3):])
 
    section = re.sub(r"\[?\d+\]?", "", section)
    section = re.sub(r"(PMID|doi|DOI|PMCID):[\s\S]{0,80}", "", section)
    section = re.sub(r"https?://\S+", "", section)
    section = re.sub(r"\s{2,}", " ", section).strip()
    if len(section) > 480:
        section = section[:480].rsplit(" ", 1)[0] + "..."
    return section
 
 
def infer_finding_from_conclusion(conclusion_text):
    """
    Narrower and less noisy than the old whole-abstract scan: this only
    reads the study's own stated conclusion, not the full text (which
    includes background framing that skews the count). Still a starting
    point, not a verdict — auto-published entries get this label, but
    it's meant to be corrected on sight, not trusted blindly.
    """
    text = conclusion_text.lower()
    pos = sum(1 for s in [
        "significant improvement", "significantly reduced", "significant reduction",
        "significantly improved", "beneficial effect", "effective", "efficacious",
        "reduced pain", "reduced anxiety", "improved sleep", "well tolerated",
        "clinically meaningful", "may be an effective", "supports the use",
    ] if s in text)
    neg = sum(1 for s in [
        "no significant", "no benefit", "not effective", "not significantly",
        "did not improve", "no improvement", "no difference between",
        "insufficient evidence", "did not reduce", "no effect on", "no reduction in",
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
 
 
def infer_audience(tier_slug):
    if tier_slug in ("meta_analysis", "systematic_review"):
        return ["patient", "provider", "researcher"]
    if tier_slug in ("rct", "clinical_trial"):
        return ["patient", "provider", "researcher"]
    if tier_slug == "observational":
        return ["patient", "provider"]
    if tier_slug == "preclinical":
        return ["researcher"]
    return ["patient", "provider", "researcher"]
 
 
def clean_title_case(text):
    if not text:
        return ""
    text = re.sub(r"Author information:.*", "", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"\(\)[\w\s,]+(?:University|Institute|Department|Hospital|School|Center|Centre|College|Faculty|Laboratory|Lab|Clinic)[^\n]*", "", text, flags=re.IGNORECASE)
    return text.strip()
 
 
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
 
def pubmed_search(query, n=25):
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
    if uid in existing_ids: return None, None
 
    title   = details.get("title", "").strip().rstrip(".")
    journal = details.get("source", "")
    authors = ", ".join(a.get("name","") for a in details.get("authors",[])[:3])
    if len(details.get("authors",[])) > 3: authors += " et al."
 
    ym = re.search(r"(\d{4})", details.get("pubdate",""))
    year = int(ym.group(1)) if ym else None
 
    raw_pt   = details.get("pubtype", [])
    pubtypes = [pt.get("value","") if isinstance(pt, dict) else str(pt) for pt in raw_pt]
 
    tier, tier_source = classify_tier(title, abstract, pubtypes)
    if tier == "RETRACTED":
        return None, {"pmid": pmid, "title": title, "reason": "retracted_publication"}
 
    on_topic = is_on_topic(title, abstract)
    conclusion = extract_conclusion(clean_title_case(abstract))
    tags = infer_tags(title, abstract)
 
    entry = {
        "id":            f"p{idx:04d}",
        "source":        "pubmed",
        "title":         title,
        "authors":       authors,
        "journal":       journal,
        "year":          year,
        "study_type":    tier,
        "evidence_tier_source": tier_source,
        "url":           f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
        "pubmed_id":     pmid,
        "doi":           None,
        "plain_summary": conclusion,
        "finding":       infer_finding_from_conclusion(conclusion),
        "tags":          tags,
        "conditions":    infer_conditions(tags),
        "cannabinoids":  infer_cannabinoids(title + " " + abstract),
        "audience":      infer_audience(tier),
        "sample_size":   extract_sample_size(abstract),
        "on_topic":      on_topic,
        "auto_publish":  bool(on_topic and tier in AUTO_PUBLISH_TIERS),
        "review_reason": None if (on_topic and tier in AUTO_PUBLISH_TIERS) else (
            "off_topic_match" if not on_topic else f"tier_below_auto_publish:{tier}"
        ),
        "approved":      False,
    }
    return entry, None
 
def run_pubmed(existing_ids):
    print("\n  📗 PubMed")
    all_pmids = set()
    for i, topic in enumerate(PUBMED_TOPICS):
        print(f"    [{i+1:02d}/{len(PUBMED_TOPICS)}] {topic[:70]}...")
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
 
    entries, retracted = [], []
    for i, det in enumerate(details_list):
        pmid     = str(det.get("uid",""))
        abstract = pubmed_abstract(pmid)
        time.sleep(0.35)
        entry, retract_flag = pubmed_to_entry(det, abstract, 1000+i, existing_ids)
        if entry:
            entries.append(entry)
            existing_ids.add(f"pmid:{pmid}")
        if retract_flag:
            retracted.append(retract_flag)
 
    print(f"    → {len(entries)} candidates from PubMed ({len(retracted)} retracted/excluded)")
    return entries, retracted
 
 
# ═══════════════════════════════════════════
#  OPENALEX SOURCE (supplementary)
# ═══════════════════════════════════════════
 
OPENALEX_BASE = "https://api.openalex.org"
 
def oa_url(path, params):
    if OPENALEX_EMAIL:
        params["mailto"] = OPENALEX_EMAIL
    return OPENALEX_BASE + path + "?" + urllib.parse.urlencode(params)
 
def openalex_search(query, n=25):
    cutoff_year = date.today().year - (LOOKBACK_DAYS // 365) if LOOKBACK_DAYS > 0 else 2000
    params = {
        "search": query,
        "per-page": n,
        "sort": "relevance_score:desc",
        "filter": f"publication_year:>{cutoff_year},type:article",
        "select": "id,title,authorships,primary_location,publication_year,doi,abstract_inverted_index,cited_by_count,type",
    }
    raw = fetch_url(oa_url("/works", params))
    if not raw: return []
    try:
        return json.loads(raw).get("results", [])
    except: return []
 
def reconstruct_abstract(inverted_index):
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
    oa_id    = work.get("id","").split("/")[-1]
    uid_oa   = f"oa:{oa_id}"
 
    if uid_doi and uid_doi in existing_ids: return None
    if uid_oa  in existing_ids: return None
 
    title = (work.get("title") or "").strip().rstrip(".")
    if not title: return None
 
    loc     = work.get("primary_location") or {}
    source  = loc.get("source") or {}
    journal = source.get("display_name") or ""
 
    auths = work.get("authorships", [])[:3]
    author_names = [(a.get("author") or {}).get("display_name","") for a in auths]
    authors = ", ".join(n for n in author_names if n)
    if len(work.get("authorships",[])) > 3: authors += " et al."
 
    year     = work.get("publication_year")
    abstract = reconstruct_abstract(work.get("abstract_inverted_index"))
 
    # OpenAlex carries no pubtype tags — text-only tier classification,
    # which means it is NEVER auto-published; it always routes to
    # pending.json for a human check. This is intentional: without a
    # peer-review signal as strong as PubMed indexing, OpenAlex hits
    # get treated as leads, not verified evidence.
    tier, _ = classify_tier(title, abstract, pubtype_list=None)
    on_topic = is_on_topic(title, abstract)
    conclusion = extract_conclusion(abstract)
    tags = infer_tags(title, abstract)
    url = f"https://doi.org/{doi}" if doi else f"https://openalex.org/{oa_id}"
 
    entry = {
        "id":            f"o{idx:04d}",
        "source":        "openalex",
        "title":         title,
        "authors":       authors,
        "journal":       journal,
        "year":          year,
        "study_type":    tier,
        "evidence_tier_source": "text",
        "url":           url,
        "pubmed_id":     None,
        "doi":           doi or None,
        "plain_summary": conclusion,
        "finding":       infer_finding_from_conclusion(conclusion),
        "tags":          tags,
        "conditions":    infer_conditions(tags),
        "cannabinoids":  infer_cannabinoids(title + " " + abstract),
        "audience":      infer_audience(tier),
        "sample_size":   extract_sample_size(abstract),
        "on_topic":      on_topic,
        "auto_publish":  False,
        "review_reason": "openalex_no_pubtype_confirmation" if on_topic else "off_topic_match",
        "approved":      False,
    }
    if uid_doi: existing_ids.add(uid_doi)
    existing_ids.add(uid_oa)
    return entry
 
def run_openalex(existing_ids):
    print("\n  📘 OpenAlex (supplementary — always routed to manual review)")
    entries = []
    for i, topic in enumerate(OPENALEX_TOPICS):
        print(f"    [{i+1:02d}/{len(OPENALEX_TOPICS)}] {topic[:70]}...")
        works = openalex_search(topic, RESULTS_PER_QUERY)
        new_count = 0
        for work in works:
            entry = openalex_to_entry(work, 3000+len(entries), existing_ids)
            if entry:
                entries.append(entry)
                new_count += 1
        print(f"           → {len(works)} results, {new_count} new")
        time.sleep(0.2)
    print(f"    → {len(entries)} candidates from OpenAlex")
    return entries
 
 
# ═══════════════════════════════════════════
#  MAIN PIPELINE
# ═══════════════════════════════════════════
 
def dedupe(entries):
    seen = set()
    out  = []
    for e in entries:
        key = re.sub(r"[^a-z0-9]","", e["title"].lower())[:80]
        if key not in seen:
            seen.add(key)
            out.append(e)
    return out
 
def sanitize_text(value):
    """Fix encoding artifacts before writing to studies.json."""
    if not isinstance(value, str):
        return value
    mojibake = [
        ("â€”", "&mdash;"), ("â€œ", "&ldquo;"),
        ("â€", "&rdquo;"), ("â€˜", "&lsquo;"),
        ("â€™", "&rsquo;"), ("â€¦", "&hellip;"),
        ("â€“", "&ndash;"),
    ]
    for bad, good in mojibake:
        value = value.replace(bad, good)
    replacements = [
        ("—", "&mdash;"), ("–", "&ndash;"), ("‘", "&lsquo;"),
        ("’", "&rsquo;"), ("“", "&ldquo;"), ("”", "&rdquo;"),
        ("…", "&hellip;"), (" ", " "),
    ]
    for char, entity in replacements:
        value = value.replace(char, entity)
    return value
 
def sanitize_entry(entry):
    return {k: sanitize_text(v) if isinstance(v, str) else v for k, v in entry.items()}
 
def run_pipeline(source_filter=None):
    print("\n🌿 mostlyCBD Evidence Pipeline v2.0")
    print("=" * 55)
    print("  Sources:    PubMed (primary) + OpenAlex (supplementary, manual-review only)" if not source_filter else f"  Source:     {source_filter}")
    print(f"  Lookback:   {LOOKBACK_DAYS} days")
    print("  Inclusion:  PubMed-indexed + recognized evidence tier + on-topic + not retracted")
    print("  No score. No keyword bonus for matching site editorial stance.")
    print("=" * 55)
 
    existing_ids = load_existing_ids()
    print(f"\n  Already tracked: {len(existing_ids)} entries\n")
 
    auto_publish, needs_review, retracted_log = [], [], []
 
    if not source_filter or source_filter == "pubmed":
        pm_entries, pm_retracted = run_pubmed(existing_ids)
        retracted_log.extend(pm_retracted)
        for e in pm_entries:
            (auto_publish if e["auto_publish"] else needs_review).append(e)
 
    if source_filter == "openalex":
        oa_entries = run_openalex(existing_ids)
        needs_review.extend(oa_entries)  # OpenAlex always needs review — see run_openalex()
 
    auto_publish = dedupe(auto_publish)
    needs_review = dedupe(needs_review)
 
    print(f"\n  ─────────────────────────────────────────")
    print(f"  Auto-publish (clears objective bar):  {len(auto_publish)}")
    print(f"  Needs a human glance (outliers):      {len(needs_review)}")
    print(f"  Retracted / excluded:                 {len(retracted_log)}")
 
    # ── Merge auto-publish entries straight into studies.json ──
    library = {"meta":{}, "studies":[]}
    if os.path.exists(STUDIES_FILE):
        with open(STUDIES_FILE, encoding="utf-8") as f:
            library = json.load(f)
    for entry in auto_publish:
        entry["id"] = f"s{len(library['studies'])+1:03d}"
        entry["approved"] = True
        library["studies"].append(sanitize_entry(entry))
    library["meta"]["last_updated"]  = date.today().isoformat()
    library["meta"]["total_entries"] = len(library["studies"])
    library["meta"]["methodology"]   = (
        "Auto-published entries clear three checkable criteria: PubMed-indexed "
        "(real peer review), a recognized clinical evidence-hierarchy publication "
        "type (meta-analysis, systematic review, RCT, or clinical trial), and "
        "on-topic relevance. No score, no editorial-stance keyword weighting."
    )
    with open(STUDIES_FILE, "w", encoding="utf-8") as f:
        json.dump(library, f, indent=2, ensure_ascii=False)
 
    # ── Outliers only go to pending.json ──
    pending = {
        "meta": {
            "generated":    datetime.now().isoformat(),
            "pipeline_version": "2.0",
            "total_pending": len(needs_review),
            "instructions": (
                "These are outliers, not a full review queue: off-topic-flagged matches, "
                "lower evidence tiers (observational/case-report/preclinical), or OpenAlex "
                "hits without PubMed's peer-review confirmation. Set 'approved': true on "
                "entries you want published, then run: python build_evidence.py --approve"
            ),
        },
        "pending": needs_review,
    }
    with open(PENDING_FILE, "w", encoding="utf-8") as f:
        json.dump(pending, f, indent=2, ensure_ascii=False)
 
    if retracted_log:
        with open("retracted_excluded.json", "w", encoding="utf-8") as f:
            json.dump(retracted_log, f, indent=2, ensure_ascii=False)
        print(f"\n  ⚠ {len(retracted_log)} retracted publication(s) excluded — logged to retracted_excluded.json")
 
    print(f"\n  ✅ {len(auto_publish)} entries auto-published to {STUDIES_FILE}")
    print(f"  📋 {len(needs_review)} outliers written to {PENDING_FILE} for your review")
    print()
 
def run_approve():
    if not os.path.exists(PENDING_FILE):
        print(f"  ⚠ {PENDING_FILE} not found. Run pipeline first.")
        return
    with open(PENDING_FILE, encoding="utf-8") as f:
        pending_data = json.load(f)
    approved = [e for e in pending_data.get("pending",[]) if e.get("approved")]
    if not approved:
        print("  ⚠ No entries marked approved. Set \"approved\": true and re-run.")
        return
    library = {"meta":{},"studies":[]}
    if os.path.exists(STUDIES_FILE):
        with open(STUDIES_FILE, encoding="utf-8") as f:
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
    with open(STUDIES_FILE, "w", encoding="utf-8") as f:
        json.dump(library, f, indent=2, ensure_ascii=False)
    print(f"\n  ✅ Added {added} entries. Library total: {library['meta']['total_entries']}")
    print(f"  Commit and push studies.json to publish.")
 
def run_stats():
    if not os.path.exists(STUDIES_FILE):
        print(f"  ⚠ {STUDIES_FILE} not found.")
        return
    with open(STUDIES_FILE, encoding="utf-8") as f:
        data = json.load(f)
    studies = [s for s in data.get("studies",[]) if s.get("approved")]
    findings = {}; types = {}; conds = {}; sources = {}
    for s in studies:
        findings[s.get("finding","mixed")] = findings.get(s.get("finding","mixed"),0)+1
        types[s.get("study_type","?")] = types.get(s.get("study_type","?"),0)+1
        src = s.get("source","manual")
        sources[src] = sources.get(src,0)+1
        for c in s.get("conditions",[]):
            conds[c] = conds.get(c,0)+1
    print(f"\n🌿 Evidence Library Stats")
    print(f"  Total:    {len(studies)}")
    print(f"  Sources:  {sources}")
    print(f"  Findings: {findings}")
    print(f"  Types:    {dict(sorted(types.items(),key=lambda x:-x[1]))}")
    print(f"  Top conditions: {dict(list(sorted(conds.items(),key=lambda x:-x[1]))[:8])}")
    print()
 
# ═══════════════════════════════════════════
#  ENTRY POINT
# ═══════════════════════════════════════════
 
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="mostlyCBD Evidence Pipeline v2.0")
    parser.add_argument("--approve",action="store_true",help="Merge approved pending.json outliers → studies.json")
    parser.add_argument("--stats",  action="store_true",help="Print library stats")
    parser.add_argument("--source", choices=["pubmed","openalex"], default=None,
                        help="Run only one source (default: PubMed, auto-publishing)")
    args = parser.parse_args()
 
    if args.approve: run_approve()
    elif args.stats: run_stats()
    else:            run_pipeline(source_filter=args.source)