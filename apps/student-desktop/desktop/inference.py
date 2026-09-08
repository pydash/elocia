import numpy as np

def get_wrist(frame):
    return np.array([frame['hand'][0]['x'], frame['hand'][0]['y'], frame['hand'][0]['z']])

def get_nose(frame):
    return np.array([frame['pose'][0]['x'], frame['pose'][0]['y'], frame['pose'][0]['z']])

def get_shoulder_width(frame):
    """Body scale reference: distance between left (11) and right (12) shoulders."""
    l = np.array([frame['pose'][11]['x'], frame['pose'][11]['y'], frame['pose'][11]['z']])
    r = np.array([frame['pose'][12]['x'], frame['pose'][12]['y'], frame['pose'][12]['z']])
    w = np.linalg.norm(l - r)
    return w if w > 0 else 0.33  # fallback: typical shoulder width in normalized image units

def get_fingertips(frame):
    # Thumb(4), Index(8), Middle(12), Ring(16), Pinky(20)
    indices = [4, 8, 12, 16, 20]
    return [np.array([frame['hand'][i]['x'], frame['hand'][i]['y'], frame['hand'][i]['z']]) for i in indices]

def _handshape_features(seq):
    """
    Extracts handshape features from several frames clustered around the middle
    of the sequence (the apex of the sign) to avoid blending in resting hands.
    - finger extension: fingertip-to-wrist distance, normalized by hand size
    - finger spread: adjacent-fingertip separations, normalized by hand size
    """
    n = len(seq)
    mid = n // 2
    k = min(9, n)
    idxs = [max(0, min(n - 1, mid - k // 2 + i)) for i in range(k)] if k > 1 else [0]
    
    ext_list, spread_list = [], []
    for i in idxs:
        f = seq[i]
        wrist = get_wrist(f)
        tips = get_fingertips(f)
        dists = np.array([np.linalg.norm(t - wrist) for t in tips])
        size = dists.max()
        if size <= 0:
            continue
        ext_list.append(dists / size)
        spread = np.array([np.linalg.norm(tips[j + 1] - tips[j]) for j in range(4)])
        spread_list.append(spread / size)
    if not ext_list:
        return None, None
    return np.median(ext_list, axis=0), np.median(spread_list, axis=0)

def calculate_handshape_score(student_seq, baseline_seq):
    """
    Compares finger extension AND finger spread against the baseline.
    A single wrongly-extended/curled finger (category error) fails,
    while small noisy deviations across fingers do not (median over frames).
    """
    if not student_seq or not baseline_seq: return 0

    s_ext, s_spread = _handshape_features(student_seq)
    b_ext, b_spread = _handshape_features(baseline_seq)
    if s_ext is None or b_ext is None or s_spread is None or b_spread is None: return 0

    ext_diff = float(np.abs(s_ext - b_ext).max())
    spread_diff = float(np.abs(s_spread - b_spread).max())

    ext_score = 100 - (ext_diff * 100)
    spread_score = 100 - (spread_diff * 80)
    return max(0, min(100, min(ext_score, spread_score)))

def calculate_palm_orientation_score(student_seq, baseline_seq):
    """
    Compares palm normal direction (from wrist -> index MCP -> pinky MCP).
    Accepts mirrored performances (either-hand signing).
    Pass line at ~40 degrees of deviation:
      <= 15 deg -> 85+, ~40 deg -> 60 (pass), ~90 deg -> ~10 (fail).
    """
    if not student_seq or not baseline_seq: return 0

    s_frame = student_seq[len(student_seq)//2]
    b_frame = baseline_seq[len(baseline_seq)//2]

    def get_palm_normal(frame):
        wrist = get_wrist(frame)
        index_mcp = np.array([frame['hand'][5]['x'], frame['hand'][5]['y'], frame['hand'][5]['z']])
        pinky_mcp = np.array([frame['hand'][17]['x'], frame['hand'][17]['y'], frame['hand'][17]['z']])

        v1 = index_mcp - wrist
        v2 = pinky_mcp - wrist
        normal = np.cross(v1, v2)
        norm = np.linalg.norm(normal)
        return normal / norm if norm > 0 else np.array([0, 0, 1])

    s_normal = get_palm_normal(s_frame)
    b_normal = get_palm_normal(b_frame)

    dot = np.dot(s_normal, b_normal)
    dot = max(-1.0, min(1.0, dot))
    angle1 = np.arccos(dot)

    # Mirrored-performance check: reflecting the hand across the camera's
    # vertical plane flips the palm normal's Y and Z components
    # (pseudovector reflection), so compare against that (either-hand signing).
    b_normal_mirrored = np.array([b_normal[0], -b_normal[1], -b_normal[2]])
    dot_mirrored = np.dot(s_normal, b_normal_mirrored)
    dot_mirrored = max(-1.0, min(1.0, dot_mirrored))
    angle2 = np.arccos(dot_mirrored)

    # Take whichever angle is smaller (closer match)
    best_angle = min(angle1, angle2)

    # 1 point lost per degree of deviation -> pass line at ~40 degrees
    score = max(0, min(100, 100 - (best_angle * 180 / np.pi)))
    return score

def calculate_location_score(student_seq, baseline_seq):
    """
    Compares where the wrist is relative to the nose, in body-scale units
    (shoulder widths) so sitting closer/farther from the camera doesn't matter.
    Accepts mirrored performances (either-hand signing), consistent with
    palm orientation and movement scoring.
    """
    if not student_seq or not baseline_seq: return 0

    s_frame = student_seq[len(student_seq)//2]
    b_frame = baseline_seq[len(baseline_seq)//2]

    def location_vector(frame):
        scale = get_shoulder_width(frame)
        return (get_wrist(frame) - get_nose(frame)) / scale

    s_vec = location_vector(s_frame)
    b_vec = location_vector(b_frame)

    dist = np.linalg.norm(s_vec - b_vec)
    # Check the mirrored location (invert the X axis)
    b_vec_mirrored = np.array([-b_vec[0], b_vec[1], b_vec[2]])
    dist_mirrored = np.linalg.norm(s_vec - b_vec_mirrored)

    best_dist = min(dist, dist_mirrored)
    # Looser location: ~0.5 shoulder-widths off still passes (60)
    score = max(0, min(100, 100 - (best_dist * 80)))
    return score

def _dtw_distance(seq_a, seq_b):
    """
    Classic Dynamic Time Warping distance: the minimal total step cost
    (Euclidean) over all monotone alignments. Unlike dtaidistance's default
    (squared inner cost + sqrt), sustained deviations accumulate linearly,
    which is what a grader needs: holding the hand wrong keeps costing points.
    """
    n, m = len(seq_a), len(seq_b)
    prev = np.full(m + 1, np.inf)
    prev[0] = 0.0
    for i in range(1, n + 1):
        curr = np.full(m + 1, np.inf)
        curr[0] = np.inf
        a = seq_a[i - 1]
        for j in range(1, m + 1):
            cost = np.linalg.norm(a - seq_b[j - 1])
            curr[j] = cost + min(prev[j], prev[j - 1], curr[j - 1])
        prev = curr
    return float(prev[m])

def calculate_movement_score(student_seq, baseline_seq):
    """
    Compares the full 3D movement trajectory of the wrist relative to the nose,
    normalized by body scale (shoulder width) so camera distance doesn't matter.
    Uses multivariate DTW, so direction matters in every axis:
    horizontal, vertical, and depth movements are all evaluated.
    """
    if len(student_seq) < 2 or len(baseline_seq) < 2: return 0

    def trajectory(seq):
        pts = []
        for f in seq:
            scale = get_shoulder_width(f)
            v = (get_wrist(f) - get_nose(f)) / scale
            pts.append(v)
        arr = np.array(pts, dtype=np.double)
        # Center the path: absolute position is Location's job;
        # Movement judges the path SHAPE (direction changes), so a
        # constant offset should not be punished here twice.
        return arr - arr.mean(axis=0, keepdims=True)

    s_traj = trajectory(student_seq)
    b_traj = trajectory(baseline_seq)

    distance_standard = _dtw_distance(s_traj, b_traj)

    # Check the mirrored trajectory (invert the X axis)
    b_traj_mirrored = b_traj.copy()
    b_traj_mirrored[:, 0] = -b_traj_mirrored[:, 0]
    distance_mirrored = _dtw_distance(s_traj, b_traj_mirrored)

    best_distance = min(distance_standard, distance_mirrored)

    # Normalize by sequence length (approximate average per-frame deviation)
    normalized_distance = best_distance / max(len(s_traj), len(b_traj))

    # A more forgiving multiplier (100 instead of 300) so that shorter
    # 3-second student recordings don't fail when matching 5-second teacher videos.
    score = max(0, min(100, 100 - (normalized_distance * 100)))
    return score

def filter_valid_frames(sequence):
    """
    Removes frames where landmarks were not detected:
    - hand missing  (hand[0].x == 0)
    - pose missing  (pose[0].x == 0, the nose) -> would poison location/movement
    """
    return [
        f for f in sequence
        if f['hand'][0]['x'] != 0 and f['pose'][0]['x'] != 0
    ]

def evaluate_sign(student_sequence, baseline_sequence):
    """
    Returns the 4 parameter scores.
    """
    s_valid = filter_valid_frames(student_sequence)
    b_valid = filter_valid_frames(baseline_sequence)
    
    # If the student didn't put their hand up at all, fail them
    if len(s_valid) < 2 or len(b_valid) < 2:
        return {
            "handshape": 10,
            "palmOrientation": 10,
            "location": 10,
            "movement": 10
        }

    h_score = calculate_handshape_score(s_valid, b_valid)
    p_score = calculate_palm_orientation_score(s_valid, b_valid)
    l_score = calculate_location_score(s_valid, b_valid)
    m_score = calculate_movement_score(s_valid, b_valid)

    return {
        "handshape": round(h_score),
        "palmOrientation": round(p_score),
        "location": round(l_score),
        "movement": round(m_score)
    }

def get_diagnostic_baseline(baseline_sequence):
    """Returns the representative mid-frame used for live single-frame diagnostics."""
    valid = filter_valid_frames(baseline_sequence)
    if not valid: return None
    return valid[len(valid)//2]

def diagnostic_frame_scores(frame, baseline_mid):
    """Live single-frame H/P/L scores vs baseline representative frame."""
    if frame['hand'][0]['x'] == 0 or frame['pose'][0]['x'] == 0:
        return {"handshape": 0, "palmOrientation": 0, "location": 0}
    
    s, b = [frame], [baseline_mid]
    return {
        "handshape": round(calculate_handshape_score(s, b)),
        "palmOrientation": round(calculate_palm_orientation_score(s, b)),
        "location": round(calculate_location_score(s, b)),
    }

