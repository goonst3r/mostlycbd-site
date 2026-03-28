#!/usr/bin/env python3
"""
auto_approve.py — mostlyCBD Smart Auto-Approver
================================================
Reads pending.json and marks "approved": true on entries that meet
ALL of the following criteria:

    1. finding  == "positive"
    2. score    >= AUTO_SCORE_MIN
    3. study_type in AUTO_STUDY_TYPES

Everything else stays "approved": false for your manual review.
A summary is printed so you know exactly what was touched and why.

Usage:
    python auto_approve.py              # Dry run — shows what WOULD be approved
    python auto_approve.py --apply      # Actually writes changes to pending.json
    python auto_approve.py --apply --score 65   # Override score threshold
    python auto_approve.py --apply --all-positive  # Approve all positive findings (looser)
"""

import json, os, argparse
from datetime import datetime

# ─────────────────────────────────────────
#  CONFIG — edit these defaults
# ─────────────────────────────────────────

PENDING_FILE    = "pending.json"

# Minimum score to auto-approve
AUTO_SCORE_MIN  = 60

# Study types that can be auto-approved
# Preclinical and plain "review" stay in manual queue — intentional
AUTO_STUDY_TYPES = {
    "rct",
    "meta_analysis",
    "systematic_review",
    "clinical_trial",
}

# ─────────────────────────────────────────

def load_pending():
    if not os.path.exists(PENDING_FILE):
        print(f"  ⚠ {PENDING_FILE} not found. Run build_evidence.py first.")
        return None
    with open(PENDING_FILE) as f:
        return json.load(f)

def evaluate(entry, score_min, all_positive=False):
    """
    Returns (would_approve: bool, reason: str).
    reason explains why it passes or fails each criterion.
    """
    finding    = entry.get("finding", "")
    score      = entry.get("score", 0)
    study_type = entry.get("study_type", "")

    if all_positive:
        if finding == "positive":
            return True, f"positive finding (all-positive mode)"
        else:
            return False, f"finding={finding} (not positive)"

    checks = []
    passing = True

    if finding == "positive":
        checks.append("✓ finding=positive")
    else:
        checks.append(f"✗ finding={finding}")
        passing = False

    if score >= score_min:
        checks.append(f"✓ score={score}>={score_min}")
    else:
        checks.append(f"✗ score={score}<{score_min}")
        passing = False

    if study_type in AUTO_STUDY_TYPES:
        checks.append(f"✓ type={study_type}")
    else:
        checks.append(f"✗ type={study_type} (manual review)")
        passing = False

    return passing, " | ".join(checks)


def run(apply=False, score_min=AUTO_SCORE_MIN, all_positive=False):
    data = load_pending()
    if data is None:
        return

    entries  = data.get("pending", [])
    total    = len(entries)

    auto_approved  = []
    manual_review  = []
    already_done   = []

    for entry in entries:
        if entry.get("approved") is True:
            already_done.append(entry)
            continue
        would_approve, reason = evaluate(entry, score_min, all_positive)
        if would_approve:
            auto_approved.append((entry, reason))
        else:
            manual_review.append((entry, reason))

    # ── Print summary ──
    mode = "DRY RUN" if not apply else "APPLYING"
    print(f"\n🌿 auto_approve.py — {mode}")
    print("=" * 55)
    print(f"  pending.json entries:  {total}")
    print(f"  Already approved:      {len(already_done)}")
    print(f"  Would auto-approve:    {len(auto_approved)}")
    print(f"  Needs manual review:   {len(manual_review)}")
    if not all_positive:
        print(f"\n  Criteria: positive + score>={score_min} + type in {sorted(AUTO_STUDY_TYPES)}")
    else:
        print(f"\n  Criteria: finding=positive (all-positive mode)")

    if auto_approved:
        print(f"\n  {'AUTO-APPROVING' if apply else 'WOULD APPROVE'}:")
        for entry, reason in auto_approved:
            title = entry.get("title","")[:65]
            print(f"    [{entry.get('score'):3d}] {title}...")
            print(f"           {reason}")

    if manual_review:
        print(f"\n  NEEDS MANUAL REVIEW ({len(manual_review)}):")
        for entry, reason in manual_review:
            title = entry.get("title","")[:65]
            print(f"    [{entry.get('score'):3d}] {title}...")
            print(f"           {reason}")

    if not apply:
        print(f"\n  ── Dry run complete. Run with --apply to write changes. ──")
        return

    # ── Write changes ──
    approved_ids = {id(e) for e, _ in auto_approved}
    for entry in entries:
        if id(entry) in approved_ids:
            entry["approved"] = True

    data["meta"]["auto_approved_at"] = datetime.now().isoformat()
    data["meta"]["auto_approved_count"] = len(auto_approved)
    data["meta"]["auto_approve_criteria"] = {
        "finding": "positive",
        "score_min": score_min,
        "study_types": sorted(AUTO_STUDY_TYPES),
        "all_positive_mode": all_positive,
    }

    with open(PENDING_FILE, "w") as f:
        json.dump(data, f, indent=2)

    print(f"\n  ✅ {len(auto_approved)} entries marked approved in {PENDING_FILE}")
    print(f"  {len(manual_review)} entries still need your review.")
    print(f"\n  When ready: python build_evidence.py --approve")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Auto-approve pending.json entries")
    parser.add_argument("--apply",        action="store_true",
                        help="Write changes (default is dry run)")
    parser.add_argument("--score",        type=int, default=AUTO_SCORE_MIN,
                        help=f"Override min score (default: {AUTO_SCORE_MIN})")
    parser.add_argument("--all-positive", action="store_true",
                        help="Approve all positive findings regardless of score/type")
    args = parser.parse_args()

    run(apply=args.apply, score_min=args.score, all_positive=args.all_positive)
