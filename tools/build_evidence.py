#!/usr/bin/env python3
"""
build_evidence.py — mostlyCBD Evidence Library Pipeline
========================================================
Queries PubMed API for cannabis research, scores each result,
and writes approved entries to studies.json for review.

Usage:
    python build_evidence.py              # Run full pipeline, write to pending.json
    python build_evidence.py --approve    # Move pending.json into studies.json after review
    python build_evidence.py --stats      # Print library stats and exit

Dependencies:
    pip install requests

PubMed API: free, no key required for low-volume use.
Rate limit: 3 requests/sec without API key, 10/sec with key.
Get a free key at: https://www.ncbi.nlm.nih.gov/account/

Config: Edit SEARCH_TOPICS and SCORING_WEIGHTS below.
"""

import json
import time
import re
import sys
import os
import argparse
from datetime import datetime, date
import urllib.request
import urllib.parse

# ─────────────────────────────────────────
#  CONFIG — edit these to expand the library
# ─────────────────────────────────────────

PUBMED_API_KEY = ""  # Optional — get free key at https://www.ncbi.nlm.nih.gov/account/
STUDIES_FILE   = "studies.json"
PENDING_FILE   = "pending.json"
THRESHOLD      = 60   # Minimum score to include in pending list

# How many results to fetch per topic query
RESULTS_PER_QUERY = 10

# Search topics — each becomes a separate PubMed query
SEARCH_TOPICS = [
    # Pain
    "cannabidiol chronic pain clinical trial",
    "CBD neuropathic pain randomized controlled",
    "cannabis pain systematic review",
    "THC CBD balanced ratio pain",

    # Anxiety / Mental Health
    "cannabidiol anxiety disorder clinical",
    "CBD PTSD treatment study",
    "cannabis anxiety depression systematic review",

    # Sleep
    "cannabidiol sleep disorder clinical study",
    "cannabis sleep quality insomnia",

    # Epilepsy / Neurology
    "cannabidiol epilepsy seizure clinical",
    "endocannabinoid system epilepsy review",
    "CBD neuroprotection neuroinflammation",

    # ECS / Mechanism
    "endocannabinoid system pain inflammation mechanism",
    "cannabinoid receptor CB1 CB2 therapeutic",

    # Specific conditions
    "cannabis multiple sclerosis spasticity",
    "cannabidiol inflammation autoimmune",
    "CBD ALS motor neuron disease",
    "cannabis PTSD nightmares veteran",
]

# ── Scoring weights ──
# Each category can add to the 0–100 score.
# Adjust to reflect your editorial standards.

STUDY_TYPE_SCORES = {
    "systematic review": 20,
    "meta-analysis": 22,
    "randomized controlled trial": 20,
    "randomized": 18,
    "clinical trial": 16,
    "observational": 10,
    "case series": 7,
    "review": 8,
    "preclinical": 5,
}

JOURNAL_QUALITY_SCORES = {
    # Top tier
    "nature": 15,
    "nejm": 15,
    "lancet": 15,
    "jama": 15,
    "annals of internal medicine": 14,
    "bmj": 14,
    # Strong clinical
    "pain": 12,
    "neuropsychopharmacology": 12,
    "psychiatric services": 11,
    "neurotherapeutics": 11,
    "muscle nerve": 10,
    # Good open access
    "pharmaceuticals": 8,
    "biomolecules": 8,
    "frontiers": 7,
    "plos": 7,
    "cannabis and cannabinoid research": 9,
    "journal of pain": 10,
    "international journal of molecular sciences": 7,
}

RECENCY_SCORES = {
    # Years old → score
    0: 15,  # Published this year
    1: 14,
    2: 12,
    3: 10,
    4: 8,
    5: 6,
    6: 5,
    7: 4,
    8: 3,
}

# Keywords that suggest CBD/balanced ratio relevance (bonus points)
CBD_RELEVANCE_KEYWORDS = [
    "cannabidiol", "cbd", "balanced ratio", "1:1", "thc:cbd",
    "full spectrum", "whole plant", "nabiximols", "sativex",
    "endocannabinoid", "entourage"
]

# Keywords that flag caution (reduce score slightly)
CAUTION_KEYWORDS = [
    "synthetic", "dronabinol", "nabilone", "high-thc", "high thc",
    "industry funded", "funded by", "manufacturer"
]

# ─────────────────────────────────────────
#  PUBMED API HELPERS
# ─────────────────────────────────────────

BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"

def build_url(endpoint, params):
    if PUBMED_API_KEY:
        params["api_key"] = PUBMED_API_KEY
    return BASE_URL + endpoint + "?" + urllib.parse.urlencode(params)

def fetch(url, retries=3):
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=15) as r:
                return r.read().decode("utf-8")
        except Exception as e:
            if attempt == retries - 1:
                print(f"  ⚠ Fetch failed after {retries} attempts: {e}")
                return None
            time.sleep(1.5)

def search_pubmed(query, max_results=10):
    """Return list of PubMed IDs for a query."""
    url = build_url("esearch.fcgi", {
        "db": "pubmed",
        "term": query,
        "retmax": max_results,
        "retmode": "json",
        "sort": "relevance"
    })
    raw = fetch(url)
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return data.get("esearchresult", {}).get("idlist", [])
    except Exception:
        return []

def fetch_details(pmid_list):
    """Fetch full metadata for a list of PMIDs."""
    if not pmid_list:
        return []
    ids = ",".join(pmid_list)
    url = build_url("esummary.fcgi", {
        "db": "pubmed",
        "id": ids,
        "retmode": "json"
    })
    raw = fetch(url)
    if not raw:
        return []
    try:
        data = json.loads(raw)
        result = data.get("result", {})
        uids = result.get("uids", [])
        return [result[uid] for uid in uids if uid in result]
    except Exception:
        return []

def fetch_abstract(pmid):
    """Fetch abstract text for a single PMID."""
    url = build_url("efetch.fcgi", {
        "db": "pubmed",
        "id": pmid,
        "retmode": "text",
        "rettype": "abstract"
    })
    raw = fetch(url)
    return raw.strip() if raw else ""

# ─────────────────────────────────────────
#  SCORING ENGINE
# ─────────────────────────────────────────

def score_study(details, abstract_text=""):
    """Score a study 0–100 based on quality signals."""
    score = 0
    notes = []

    # ── 1. Study type (from title + abstract) ──
    text = (details.get("title", "") + " " + abstract_text).lower()
    type_found = "unknown"
    best_type_score = 0

    for study_type, pts in STUDY_TYPE_SCORES.items():
        if study_type in text and pts > best_type_score:
            best_type_score = pts
            type_found = study_type

    score += best_type_score
    notes.append(f"Study type: {type_found} (+{best_type_score})")

    # ── 2. Journal quality ──
    journal = details.get("source", "").lower()
    journal_score = 5  # default for unknown journals
    for j_name, pts in JOURNAL_QUALITY_SCORES.items():
        if j_name in journal:
            journal_score = pts
            break
    score += journal_score
    notes.append(f"Journal: {details.get('source', 'unknown')} (+{journal_score})")

    # ── 3. Recency ──
    pub_year = None
    pub_date = details.get("pubdate", "")
    year_match = re.search(r"(\d{4})", pub_date)
    if year_match:
        pub_year = int(year_match.group(1))
        years_old = max(0, date.today().year - pub_year)
        recency_score = RECENCY_SCORES.get(years_old, 2)
        score += recency_score
        notes.append(f"Recency: {pub_year}, {years_old} years old (+{recency_score})")

    # ── 4. CBD/balanced ratio relevance ──
    cbd_hits = sum(1 for kw in CBD_RELEVANCE_KEYWORDS if kw in text)
    cbd_score = min(cbd_hits * 4, 20)
    score += cbd_score
    if cbd_score:
        notes.append(f"CBD relevance: {cbd_hits} keywords (+{cbd_score})")

    # ── 5. Sample size signals ──
    sample_patterns = [
        (r"n\s*=\s*(\d{3,})", 8),
        (r"(\d{3,})\s+patients", 8),
        (r"(\d{3,})\s+participants", 8),
        (r"(\d{2,})\s+studies", 6),
        (r"(\d{2,})\s+trials", 6),
    ]
    sample_score = 0
    for pattern, pts in sample_patterns:
        match = re.search(pattern, abstract_text.lower())
        if match:
            n = int(match.group(1))
            if n >= 1000:
                sample_score = max(sample_score, pts + 5)
            elif n >= 500:
                sample_score = max(sample_score, pts + 3)
            elif n >= 100:
                sample_score = max(sample_score, pts)
            elif n >= 50:
                sample_score = max(sample_score, pts - 2)
            break
    score += sample_score
    if sample_score:
        notes.append(f"Sample size signals (+{sample_score})")

    # ── 6. Caution flags (reduce score) ──
    caution_hits = sum(1 for kw in CAUTION_KEYWORDS if kw in text)
    caution_deduct = caution_hits * 3
    score -= caution_deduct
    if caution_deduct:
        notes.append(f"Caution flags: {caution_hits} keywords (-{caution_deduct})")

    # Clamp to 0–100
    score = max(0, min(100, score))
    return score, "; ".join(notes), type_found, pub_year

def infer_finding(abstract_text):
    """Rough heuristic: classify finding as positive/negative/mixed."""
    text = abstract_text.lower()

    positive_signals = [
        "significant improvement", "significantly reduced", "significant reduction",
        "beneficial", "effective", "efficacious", "demonstrated benefit",
        "reduced pain", "reduced anxiety", "improved sleep", "positive outcome",
        "promising", "potential treatment", "may be useful"
    ]
    negative_signals = [
        "no significant", "no benefit", "not effective", "worsened", "failed to",
        "did not improve", "no improvement", "no difference", "insufficient evidence",
        "negative result"
    ]

    pos = sum(1 for s in positive_signals if s in text)
    neg = sum(1 for s in negative_signals if s in text)

    if pos > 0 and neg == 0:
        return "positive"
    elif neg > 0 and pos == 0:
        return "negative"
    else:
        return "mixed"

def infer_tags(abstract_text, title):
    """Auto-tag based on keyword matching."""
    text = (abstract_text + " " + title).lower()
    tag_map = {
        "pain":          ["pain", "analgesic", "nocicepti"],
        "neuropathy":    ["neuropath", "allodynia", "hyperalgesia"],
        "anxiety":       ["anxiety", "anxiolytic", "gad", "social anxiety"],
        "ptsd":          ["ptsd", "post-traumatic", "posttraumatic"],
        "sleep":         ["sleep", "insomnia", "somnolen"],
        "epilepsy":      ["epilepsy", "seizure", "anticonvulsant"],
        "inflammation":  ["inflamm", "anti-inflamm", "cytokine"],
        "depression":    ["depress", "antidepressant"],
        "cancer":        ["cancer", "oncolog", "tumor", "chemotherap"],
        "ms":            ["multiple sclerosis", "spasticity"],
        "als":           ["amyotrophic", "als", "motor neuron"],
        "cbd-only":      ["cannabidiol", "cbd"],
        "thc":           ["tetrahydrocannabinol", "delta-9", "thc"],
        "balanced":      ["1:1", "balanced", "nabiximols", "sativex"],
        "full-spectrum": ["full spectrum", "whole plant"],
        "mechanism":     ["mechanism", "receptor", "cb1", "cb2", "5-ht1a"],
        "safety":        ["safety", "adverse", "tolerab", "side effect"],
        "ecs":           ["endocannabinoid"],
        "preclinical":   ["mouse", "rat", "animal model", "in vitro", "in vivo"],
        "rct":           ["randomized controlled", "double-blind", "placebo-controlled"],
    }

    found = []
    for tag, keywords in tag_map.items():
        if any(kw in text for kw in keywords):
            found.append(tag)
    return found[:8]  # Cap at 8 tags

def infer_cannabinoids(text):
    found = []
    text = text.lower()
    if "cannabidiol" in text or " cbd " in text:
        found.append("cbd")
    if "tetrahydrocannabinol" in text or " thc " in text or "delta-9" in text:
        found.append("thc")
    if "balanced" in text or "1:1" in text or "nabiximols" in text or "sativex" in text:
        if "balanced" not in found:
            found.append("balanced")
    if "full spectrum" in text or "whole plant" in text:
        found.append("full-spectrum")
    if "cannabigerol" in text or " cbg " in text:
        found.append("cbg")
    return found or ["cbd"]

def infer_conditions(tags):
    condition_map = {
        "pain": "chronic-pain",
        "neuropathy": "neuropathic-pain",
        "anxiety": "anxiety",
        "ptsd": "ptsd",
        "sleep": "sleep",
        "epilepsy": "epilepsy",
        "inflammation": "inflammation",
        "depression": "depression",
        "cancer": "cancer-related",
        "ms": "ms",
        "als": "als",
    }
    return [condition_map[t] for t in tags if t in condition_map]

def infer_audience(study_type, score):
    audience = []
    if study_type in ["systematic review", "meta-analysis", "review"]:
        audience = ["patient", "provider", "researcher"]
    elif study_type in ["randomized controlled trial", "randomized", "clinical trial"]:
        audience = ["provider", "researcher"]
        if score >= 75:
            audience.insert(0, "patient")
    elif study_type in ["observational", "case series"]:
        audience = ["patient", "provider"]
    else:
        audience = ["researcher"]
    return audience

# ─────────────────────────────────────────
#  MAIN PIPELINE
# ─────────────────────────────────────────

def load_existing_ids():
    """Get all IDs already in studies.json to avoid duplicates."""
    if not os.path.exists(STUDIES_FILE):
        return set()
    with open(STUDIES_FILE) as f:
        data = json.load(f)
    existing = set()
    for s in data.get("studies", []):
        if s.get("pubmed_id"):
            existing.add(str(s["pubmed_id"]))
    return existing

def build_study_entry(details, abstract_text, idx_offset, existing_ids):
    """Build a full study entry dict from PubMed details."""
    pmid = str(details.get("uid", ""))

    # Skip if already in library
    if pmid in existing_ids:
        return None

    title = details.get("title", "").strip().rstrip(".")
    journal = details.get("source", "")
    authors_list = details.get("authors", [])
    authors = ", ".join(a.get("name", "") for a in authors_list[:3])
    if len(authors_list) > 3:
        authors += " et al."

    pub_date = details.get("pubdate", "")
    year_match = re.search(r"(\d{4})", pub_date)
    year = int(year_match.group(1)) if year_match else date.today().year

    score, score_notes, study_type, _ = score_study(details, abstract_text)
    finding = infer_finding(abstract_text)
    tags = infer_tags(abstract_text, title)
    conditions = infer_conditions(tags)
    cannabinoids = infer_cannabinoids(abstract_text + " " + title)
    audience = infer_audience(study_type, score)

    # Sample size extraction
    sample_size = "See source"
    for pattern in [r"n\s*=\s*(\d+)", r"(\d+)\s+patients", r"(\d+)\s+participants", r"(\d+)\s+studies"]:
        m = re.search(pattern, abstract_text.lower())
        if m:
            sample_size = f"n={m.group(1)}"
            break

    # Build plain summary from abstract (first ~2 sentences)
    if abstract_text:
        sentences = re.split(r'(?<=[.!?])\s+', abstract_text.strip())
        plain_summary = " ".join(sentences[:3])[:400]
        if len(plain_summary) == 400:
            plain_summary = plain_summary.rsplit(" ", 1)[0] + "..."
    else:
        plain_summary = "Abstract not available. See source for full details."

    return {
        "id": f"p{str(idx_offset).zfill(3)}",
        "title": title,
        "authors": authors,
        "journal": journal,
        "year": year,
        "study_type": study_type.replace(" ", "_") if "_" not in study_type else study_type,
        "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
        "pubmed_id": pmid,
        "plain_summary": plain_summary,
        "finding": finding,
        "tags": tags,
        "conditions": conditions,
        "cannabinoids": cannabinoids,
        "audience": audience,
        "sample_size": sample_size,
        "score": score,
        "score_notes": score_notes,
        "approved": False  # Requires manual review
    }

def run_pipeline():
    print("\n🌿 mostlyCBD Evidence Pipeline")
    print("=" * 45)
    print(f"  Queries: {len(SEARCH_TOPICS)}")
    print(f"  Results per query: {RESULTS_PER_QUERY}")
    print(f"  Score threshold: {THRESHOLD}")
    print("=" * 45)

    existing_ids = load_existing_ids()
    print(f"\n  Existing library: {len(existing_ids)} entries (will skip duplicates)")

    all_pmids = set()
    for i, topic in enumerate(SEARCH_TOPICS):
        print(f"\n  [{i+1}/{len(SEARCH_TOPICS)}] Searching: {topic[:55]}...")
        pmids = search_pubmed(topic, RESULTS_PER_QUERY)
        new_pmids = [p for p in pmids if p not in existing_ids]
        all_pmids.update(new_pmids)
        print(f"    → {len(pmids)} results, {len(new_pmids)} new")
        time.sleep(0.4)  # Respect rate limit

    print(f"\n  Total unique new PMIDs to evaluate: {len(all_pmids)}")

    # Fetch details in batches of 20
    pmid_list = list(all_pmids)
    all_details = []
    for i in range(0, len(pmid_list), 20):
        batch = pmid_list[i:i+20]
        details = fetch_details(batch)
        all_details.extend(details)
        time.sleep(0.3)

    print(f"\n  Fetched details for {len(all_details)} studies")
    print("  Scoring and filtering...")

    candidates = []
    skipped = 0

    for i, details in enumerate(all_details):
        pmid = str(details.get("uid", ""))

        # Fetch abstract
        abstract = fetch_abstract(pmid)
        time.sleep(0.35)

        entry = build_study_entry(details, abstract, i + 1000, existing_ids)
        if entry is None:
            skipped += 1
            continue

        if entry["score"] >= THRESHOLD:
            candidates.append(entry)
            print(f"    ✓ [{entry['score']:3d}] {entry['title'][:65]}...")
        else:
            print(f"    ✗ [{entry['score']:3d}] Below threshold — {entry['title'][:50]}...")

    print(f"\n  Results: {len(candidates)} candidates above threshold, {skipped} skipped (duplicates)")

    # Write to pending.json
    pending = {
        "meta": {
            "generated": datetime.now().isoformat(),
            "pipeline_version": "1.0",
            "threshold_used": THRESHOLD,
            "total_pending": len(candidates),
            "instructions": (
                "Review each entry. Set 'approved': true for entries you want in the library. "
                "Then run: python build_evidence.py --approve"
            )
        },
        "pending": candidates
    }

    with open(PENDING_FILE, "w") as f:
        json.dump(pending, f, indent=2)

    print(f"\n  ✅ Written to {PENDING_FILE}")
    print(f"\n  Next steps:")
    print(f"  1. Open {PENDING_FILE} and review each entry")
    print(f"  2. Set \"approved\": true for ones you want to publish")
    print(f"  3. Edit plain_summary to match your voice if needed")
    print(f"  4. Run: python build_evidence.py --approve")
    print()

def run_approve():
    """Merge approved pending entries into studies.json."""
    if not os.path.exists(PENDING_FILE):
        print(f"  ⚠ No {PENDING_FILE} found. Run pipeline first.")
        return

    with open(PENDING_FILE) as f:
        pending_data = json.load(f)

    approved = [e for e in pending_data.get("pending", []) if e.get("approved")]

    if not approved:
        print(f"  ⚠ No approved entries in {PENDING_FILE}.")
        print("  Open it, set \"approved\": true on entries you want, then re-run.")
        return

    # Load existing library
    if os.path.exists(STUDIES_FILE):
        with open(STUDIES_FILE) as f:
            library = json.load(f)
    else:
        library = {"meta": {}, "studies": []}

    existing_ids = {s.get("pubmed_id") for s in library["studies"]}

    added = 0
    for entry in approved:
        if entry.get("pubmed_id") not in existing_ids:
            # Assign final ID
            next_id = f"s{str(len(library['studies']) + 1).zfill(3)}"
            entry["id"] = next_id
            library["studies"].append(entry)
            existing_ids.add(entry.get("pubmed_id"))
            added += 1

    # Update meta
    library["meta"]["last_updated"] = date.today().isoformat()
    library["meta"]["total_entries"] = len(library["studies"])

    with open(STUDIES_FILE, "w") as f:
        json.dump(library, f, indent=2)

    print(f"\n  ✅ Added {added} entries to {STUDIES_FILE}")
    print(f"  Library now contains {library['meta']['total_entries']} studies")
    print(f"\n  Commit and push {STUDIES_FILE} to GitHub to go live.")

def run_stats():
    if not os.path.exists(STUDIES_FILE):
        print(f"  ⚠ {STUDIES_FILE} not found.")
        return

    with open(STUDIES_FILE) as f:
        data = json.load(f)

    studies = data.get("studies", [])
    approved = [s for s in studies if s.get("approved")]

    findings = {"positive": 0, "negative": 0, "mixed": 0}
    types = {}
    conditions = {}
    scores = []

    for s in approved:
        findings[s.get("finding", "mixed")] = findings.get(s.get("finding", "mixed"), 0) + 1
        st = s.get("study_type", "unknown")
        types[st] = types.get(st, 0) + 1
        scores.append(s.get("score", 0))
        for c in s.get("conditions", []):
            conditions[c] = conditions.get(c, 0) + 1

    print(f"\n🌿 mostlyCBD Evidence Library Stats")
    print("=" * 40)
    print(f"  Total entries:   {len(approved)}")
    print(f"  Avg score:       {sum(scores)/len(scores):.1f}" if scores else "  No scored entries")
    print(f"\n  Findings:")
    for k, v in findings.items():
        print(f"    {k:12s}: {v}")
    print(f"\n  Study types:")
    for k, v in sorted(types.items(), key=lambda x: -x[1]):
        print(f"    {k:25s}: {v}")
    print(f"\n  Top conditions:")
    for k, v in sorted(conditions.items(), key=lambda x: -x[1])[:8]:
        print(f"    {k:25s}: {v}")
    print()

# ─────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="mostlyCBD Evidence Library Pipeline")
    parser.add_argument("--approve", action="store_true", help="Merge approved pending.json into studies.json")
    parser.add_argument("--stats",   action="store_true", help="Print library stats")
    args = parser.parse_args()

    if args.approve:
        run_approve()
    elif args.stats:
        run_stats()
    else:
        run_pipeline()
