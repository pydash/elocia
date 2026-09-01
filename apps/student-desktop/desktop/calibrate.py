"""
ELOCIA Scoring Calibration Harness
===================================
Verifies and tunes the scoring engine in inference.py.

Usage (from apps/student-desktop/desktop with the venv active):
    python calibrate.py selftest     # baseline vs itself -> should be ~100 everywhere
    python calibrate.py variants     # synthetic error variants -> each must fail ONLY its own parameter
    python calibrate.py table        # full pass/fail matrix report

Calibration philosophy ("understandable, not perfect"):
  A sign that a Deaf reader would still understand should PASS (>= 60).
  A category error (wrong finger, wrong palm way, wrong region, wrong direction)
  should FAIL (< 60) its own parameter only.
"""
import json
import os
import sys

import numpy as np

from inference import evaluate_sign

BASELINE_DIR = os.path.join(os.path.dirname(__file__), 'baselines')

PASS_LINE = 60


def load_baseline(stage_id=1):
    path = os.path.join(BASELINE_DIR, f'baseline_{stage_id}.json')
    with open(path, 'r') as f:
        return json.load(f)


def score_pair(student_seq, baseline_seq, label):
    scores = evaluate_sign(student_seq, baseline_seq)
    overall = sum(scores.values()) / 4
    return scores, overall, label


def print_result(scores, overall, label):
    def mark(v):
        return 'PASS' if v >= PASS_LINE else 'FAIL'
    print(f"\n--- {label} ---")
    print(f"  handshape:       {scores['handshape']:>3}  {mark(scores['handshape'])}")
    print(f"  palmOrientation: {scores['palmOrientation']:>3}  {mark(scores['palmOrientation'])}")
    print(f"  location:        {scores['location']:>3}  {mark(scores['location'])}")
    print(f"  movement:        {scores['movement']:>3}  {mark(scores['movement'])}")
    print(f"  overall:         {overall:>6.1f}  {mark(overall)}")


def self_test():
    baseline = load_baseline(1)
    scores, overall, _ = score_pair(baseline, baseline, 'SELF-TEST: baseline vs itself')
    print_result(scores, overall, 'baseline vs itself')
    ok = all(v >= 95 for v in scores.values())
    print("\nSelf-test:", "OK (all >= 95)" if ok else "PROBLEM: self-similarity below 95")
    return ok


# ---------------- Synthetic variants ----------------
# Each variant simulates one kind of student performance. Expected outcome
# follows the calibration philosophy: quality errors PASS, category errors
# FAIL their own parameter.

def _valid(frame):
    return frame['hand'][0]['x'] != 0 and frame['pose'][0]['x'] != 0


def v_mirrored(baseline):
    """Either-hand signing: mirror everything on X. Expect: ALL PASS."""
    import copy
    seq = copy.deepcopy(baseline)
    for fr in seq:
        for part in ('hand', 'pose'):
            for lm in fr[part]:
                lm['x'] = -lm['x']
    return seq, 'mirrored performance (either hand)', 'all_pass'


def v_body_scaled(baseline, factor=0.75):
    """Student sits farther from the camera. Expect: ALL PASS."""
    import copy
    seq = copy.deepcopy(baseline)
    for fr in seq:
        if not _valid(fr):
            continue  # leave invalid frames at zero so filtering still removes them
        for part in ('hand', 'pose'):
            for lm in fr[part]:
                lm['x'] = 0.5 + (lm['x'] - 0.5) * factor
                lm['y'] = 0.5 + (lm['y'] - 0.5) * factor
                lm['z'] = lm['z'] * factor
    return seq, f'body scaled x{factor} (farther away)', 'all_pass'


def v_curled_index(baseline, keep=0.3):
    """Index fingertip curled toward the wrist (category error). Expect: handshape FAIL."""
    import copy
    seq = copy.deepcopy(baseline)
    for fr in seq:
        if not _valid(fr):
            continue
        w, tip = fr['hand'][0], fr['hand'][8]
        tip['x'] = w['x'] + (tip['x'] - w['x']) * keep
        tip['y'] = w['y'] + (tip['y'] - w['y']) * keep
        tip['z'] = w['z'] + (tip['z'] - w['z']) * keep
    return seq, 'index finger curled (wrong handshape)', {'handshape'}


def v_palm_rotated(baseline, degrees):
    """Hand rotated around the wrist about the vertical axis. Expect: palm FAIL if deg > ~45."""
    import copy
    seq = copy.deepcopy(baseline)
    rad = np.radians(degrees)
    cos, sin = np.cos(rad), np.sin(rad)
    for fr in seq:
        if not _valid(fr):
            continue
        w = fr['hand'][0]
        for lm in fr['hand']:
            dx, dz = lm['x'] - w['x'], lm['z'] - w['z']
            lm['x'] = w['x'] + dx * cos + dz * sin
            lm['z'] = w['z'] - dx * sin + dz * cos
    return seq, f'palm rotated {degrees} deg', ({'palmOrientation'} if degrees > 45 else 'all_pass')


def v_location_shifted(baseline, dy=0.7):
    """Whole hand shifted down heavily (in shoulder-width units) - wrong location. Expect: location FAIL."""
    import copy
    seq = copy.deepcopy(baseline)
    for fr in seq:
        if not _valid(fr):
            continue
        l = fr['pose'][11]; r = fr['pose'][12]
        sw = max(0.05, ((l['x']-r['x'])**2 + (l['y']-r['y'])**2 + (l['z']-r['z'])**2) ** 0.5)
        offset = dy * sw
        for lm in fr['hand']:
            lm['y'] += offset
    return seq, f'hand shifted down {dy} shoulder-widths', {'location'}


def v_wobble(baseline, amplitude_sw=1.0, cycles=3):
    """Extra movement where the teacher had none: hand wobbles side-to-side
    (~1 shoulder-width, zero-mean so mid-frame location is unchanged).
    Expect: movement FAIL only."""
    import copy
    seq = copy.deepcopy(baseline)
    valid_idx = [i for i, fr in enumerate(seq) if _valid(fr)]
    n = len(valid_idx)
    for j, i in enumerate(valid_idx):
        fr = seq[i]
        l = fr['pose'][11]; r = fr['pose'][12]
        sw = max(0.05, ((l['x']-r['x'])**2 + (l['y']-r['y'])**2 + (l['z']-r['z'])**2) ** 0.5)
        offset = amplitude_sw * sw * np.sin(2 * np.pi * cycles * j / max(1, n - 1))
        for lm in fr['hand']:
            lm['x'] += offset
    return seq, f'wobbling hand (extra movement, {amplitude_sw} shoulder-width)', {'movement'}


def run_variants():
    baseline = load_baseline(1)
    variants = [
        v_mirrored(baseline),
        v_body_scaled(baseline),
        v_palm_rotated(baseline, 25),
        v_curled_index(baseline),
        v_palm_rotated(baseline, 90),
        v_location_shifted(baseline),
        v_wobble(baseline),
    ]
    all_ok = True
    for seq, label, expected in variants:
        scores, overall, _ = score_pair(seq, baseline, label)
        print_result(scores, overall, label)
        if expected == 'all_pass':
            ok = all(v >= PASS_LINE for v in scores.values())
            verdict = 'OK' if ok else 'MISMATCH (expected all PASS)'
        else:
            unexpected = {p for p, v in scores.items() if v < PASS_LINE} - set(expected)
            missing = set(expected) - {p for p, v in scores.items() if v < PASS_LINE}
            ok = not unexpected and not missing
            verdict = 'OK' if ok else f'MISMATCH (unexpected fails: {unexpected or "-"}, missed fails: {missing or "-"})'
        print(f"  expectation: {verdict}")
        all_ok = all_ok and ok
    return all_ok


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'selftest'
    if cmd == 'selftest':
        sys.exit(0 if self_test() else 1)
    elif cmd == 'variants':
        sys.exit(0 if run_variants() else 1)
    elif cmd == 'table':
        ok1 = self_test()
        ok2 = run_variants()
        print("\n===== CALIBRATION", "PASSED" if (ok1 and ok2) else "NEEDS TUNING", "=====")
        sys.exit(0 if (ok1 and ok2) else 1)
    else:
        print(f"Unknown command: {cmd}")
        print("Available: selftest, variants, table")
