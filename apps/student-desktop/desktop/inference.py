import numpy as np

def _is_hand_present(landmarks):
    if not landmarks or len(landmarks) < 21:
        return False
    # Check if wrist or first few landmarks have non-zero coordinates
    return any(lm['x'] != 0 or lm['y'] != 0 for lm in landmarks[:5])

def get_wrist(frame, hand_key="hand"):
    hand = frame.get(hand_key, frame.get("hand", []))
    if not hand or len(hand) == 0:
        return np.array([0.0, 0.0, 0.0])
    return np.array([hand[0]['x'], hand[0]['y'], hand[0]['z']])

def get_nose(frame):
    if not frame.get('pose') or len(frame['pose']) == 0:
        return np.array([0.0, 0.0, 0.0])
    return np.array([frame['pose'][0]['x'], frame['pose'][0]['y'], frame['pose'][0]['z']])

def get_shoulder_width(frame):
    """Body scale reference: distance between left (11) and right (12) shoulders."""
    if not frame.get('pose') or len(frame['pose']) < 13:
        return 0.33
    l = np.array([frame['pose'][11]['x'], frame['pose'][11]['y'], frame['pose'][11]['z']])
    r = np.array([frame['pose'][12]['x'], frame['pose'][12]['y'], frame['pose'][12]['z']])
    w = np.linalg.norm(l - r)
    return w if w > 0 else 0.33

def get_fingertips(frame, hand_key="hand"):
    # Thumb(4), Index(8), Middle(12), Ring(16), Pinky(20)
    indices = [4, 8, 12, 16, 20]
    hand = frame.get(hand_key, frame.get("hand", []))
    if not hand or len(hand) < 21:
        return [np.zeros(3) for _ in indices]
    return [np.array([hand[i]['x'], hand[i]['y'], hand[i]['z']]) for i in indices]

def is_two_handed_sequence(seq):
    """
    Checks if a sequence consistently contains landmarks for both hands (>25% of frames).
    """
    if not seq:
        return False
    both_count = 0
    for f in seq:
        has_r = f.get("has_right", False) or _is_hand_present(f.get("right_hand"))
        has_l = f.get("has_left", False) or _is_hand_present(f.get("left_hand"))
        if has_r and has_l:
            both_count += 1
    return (both_count / len(seq)) >= 0.25

def _handshape_features_for_hand(seq, hand_key):
    n = len(seq)
    mid = n // 2
    k = min(9, n)
    idxs = [max(0, min(n - 1, mid - k // 2 + i)) for i in range(k)] if k > 1 else [0]
    
    ext_list, spread_list = [], []
    for i in idxs:
        f = seq[i]
        wrist = get_wrist(f, hand_key)
        tips = get_fingertips(f, hand_key)
        dists = np.array([np.linalg.norm(t - wrist) for t in tips])
        size = dists.max()
        if size <= 0.001:
            continue
        ext_list.append(dists / size)
        spread = np.array([np.linalg.norm(tips[j + 1] - tips[j]) for j in range(4)])
        spread_list.append(spread / size)
    if not ext_list:
        return None, None
    return np.median(ext_list, axis=0), np.median(spread_list, axis=0)

def calculate_single_handshape_score(s_seq, b_seq, s_key="hand", b_key="hand"):
    s_ext, s_spread = _handshape_features_for_hand(s_seq, s_key)
    b_ext, b_spread = _handshape_features_for_hand(b_seq, b_key)
    if s_ext is None or b_ext is None or s_spread is None or b_spread is None:
        return 0

    ext_diff = float(np.abs(s_ext - b_ext).max())
    spread_diff = float(np.abs(s_spread - b_spread).max())

    ext_score = 100 - (ext_diff * 100)
    spread_score = 100 - (spread_diff * 80)
    return max(0, min(100, min(ext_score, spread_score)))

def calculate_handshape_score(student_seq, baseline_seq):
    if not student_seq or not baseline_seq: return 0

    is_b_two = is_two_handed_sequence(baseline_seq)
    is_s_two = is_two_handed_sequence(student_seq)

    if is_b_two and is_s_two:
        # Evaluate both hands: allow direct (R-R, L-L) or mirrored (R-L, L-R)
        direct_r = calculate_single_handshape_score(student_seq, baseline_seq, "right_hand", "right_hand")
        direct_l = calculate_single_handshape_score(student_seq, baseline_seq, "left_hand", "left_hand")
        direct_score = (direct_r + direct_l) / 2.0

        mirror_r = calculate_single_handshape_score(student_seq, baseline_seq, "right_hand", "left_hand")
        mirror_l = calculate_single_handshape_score(student_seq, baseline_seq, "left_hand", "right_hand")
        mirror_score = (mirror_r + mirror_l) / 2.0

        return max(direct_score, mirror_score)
    else:
        # One-handed evaluation: compare student's dominant hand against baseline
        # Try both primary hand, right hand, or left hand for maximum student flexibility
        scores = []
        for s_k in ["hand", "right_hand", "left_hand"]:
            for b_k in ["hand", "right_hand", "left_hand"]:
                sc = calculate_single_handshape_score(student_seq, baseline_seq, s_k, b_k)
                if sc > 0:
                    scores.append(sc)
        return max(scores) if scores else 0

def _get_palm_normal_for_hand(frame, hand_key="hand"):
    hand = frame.get(hand_key, frame.get("hand", []))
    if not hand or len(hand) < 21:
        return np.array([0, 0, 1])
    wrist = np.array([hand[0]['x'], hand[0]['y'], hand[0]['z']])
    index_mcp = np.array([hand[5]['x'], hand[5]['y'], hand[5]['z']])
    pinky_mcp = np.array([hand[17]['x'], hand[17]['y'], hand[17]['z']])

    v1 = index_mcp - wrist
    v2 = pinky_mcp - wrist
    normal = np.cross(v1, v2)
    norm = np.linalg.norm(normal)
    return normal / norm if norm > 0 else np.array([0, 0, 1])

def calculate_single_palm_score(s_frame, b_frame, s_key="hand", b_key="hand"):
    s_normal = _get_palm_normal_for_hand(s_frame, s_key)
    b_normal = _get_palm_normal_for_hand(b_frame, b_key)

    dot = np.dot(s_normal, b_normal)
    dot = max(-1.0, min(1.0, dot))
    angle1 = np.arccos(dot)

    b_normal_mirrored = np.array([b_normal[0], -b_normal[1], -b_normal[2]])
    dot_mirrored = np.dot(s_normal, b_normal_mirrored)
    dot_mirrored = max(-1.0, min(1.0, dot_mirrored))
    angle2 = np.arccos(dot_mirrored)

    best_angle = min(angle1, angle2)
    return max(0, min(100, 100 - (best_angle * 180 / np.pi)))

def calculate_palm_orientation_score(student_seq, baseline_seq):
    if not student_seq or not baseline_seq: return 0

    s_frame = student_seq[len(student_seq)//2]
    b_frame = baseline_seq[len(baseline_seq)//2]

    is_b_two = is_two_handed_sequence(baseline_seq)
    is_s_two = is_two_handed_sequence(student_seq)

    if is_b_two and is_s_two:
        direct = (calculate_single_palm_score(s_frame, b_frame, "right_hand", "right_hand") +
                  calculate_single_palm_score(s_frame, b_frame, "left_hand", "left_hand")) / 2.0
        mirror = (calculate_single_palm_score(s_frame, b_frame, "right_hand", "left_hand") +
                  calculate_single_palm_score(s_frame, b_frame, "left_hand", "right_hand")) / 2.0
        return max(direct, mirror)
    else:
        scores = []
        for s_k in ["hand", "right_hand", "left_hand"]:
            for b_k in ["hand", "right_hand", "left_hand"]:
                scores.append(calculate_single_palm_score(s_frame, b_frame, s_k, b_k))
        return max(scores) if scores else 0

def calculate_location_score(student_seq, baseline_seq):
    if not student_seq or not baseline_seq: return 0

    s_frame = student_seq[len(student_seq)//2]
    b_frame = baseline_seq[len(baseline_seq)//2]

    is_b_two = is_two_handed_sequence(baseline_seq)
    is_s_two = is_two_handed_sequence(student_seq)

    scale_s = get_shoulder_width(s_frame)
    scale_b = get_shoulder_width(b_frame)
    nose_s = get_nose(s_frame)
    nose_b = get_nose(b_frame)

    if is_b_two and is_s_two:
        # In 2-hand signs, evaluate both wrists relative to body AND relative distance between both hands
        s_rw = (get_wrist(s_frame, "right_hand") - nose_s) / scale_s
        s_lw = (get_wrist(s_frame, "left_hand") - nose_s) / scale_s
        b_rw = (get_wrist(b_frame, "right_hand") - nose_b) / scale_b
        b_lw = (get_wrist(b_frame, "left_hand") - nose_b) / scale_b

        # Relative hand separation (in shoulder widths)
        s_sep = np.linalg.norm(get_wrist(s_frame, "right_hand") - get_wrist(s_frame, "left_hand")) / scale_s
        b_sep = np.linalg.norm(get_wrist(b_frame, "right_hand") - get_wrist(b_frame, "left_hand")) / scale_b
        sep_diff = abs(s_sep - b_sep)

        # Direct vs mirrored placement
        dist_direct = (np.linalg.norm(s_rw - b_rw) + np.linalg.norm(s_lw - b_lw)) / 2.0
        dist_mirror = (np.linalg.norm(s_rw - np.array([-b_lw[0], b_lw[1], b_lw[2]])) +
                       np.linalg.norm(s_lw - np.array([-b_rw[0], b_rw[1], b_rw[2]]))) / 2.0
        best_dist = min(dist_direct, dist_mirror)

        total_err = (best_dist * 0.7) + (sep_diff * 0.3)
        return max(0, min(100, 100 - (total_err * 45)))
    else:
        def location_vector(frame, key="hand"):
            scale = get_shoulder_width(frame)
            return (get_wrist(frame, key) - get_nose(frame)) / scale

        scores = []
        for s_k in ["hand", "right_hand", "left_hand"]:
            for b_k in ["hand", "right_hand", "left_hand"]:
                s_vec = location_vector(s_frame, s_k)
                b_vec = location_vector(b_frame, b_k)
                dist = np.linalg.norm(s_vec - b_vec)
                b_vec_mirrored = np.array([-b_vec[0], b_vec[1], b_vec[2]])
                dist_mirrored = np.linalg.norm(s_vec - b_vec_mirrored)
                best_dist = min(dist, dist_mirrored)
                scores.append(max(0, min(100, 100 - (best_dist * 45))))
        return max(scores) if scores else 0

def _dtw_distance(seq_a, seq_b):
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
    if len(student_seq) < 2 or len(baseline_seq) < 2: return 0

    is_b_two = is_two_handed_sequence(baseline_seq)
    is_s_two = is_two_handed_sequence(student_seq)

    def trajectory(seq, hand_key="hand"):
        pts = []
        for f in seq:
            scale = get_shoulder_width(f)
            v = (get_wrist(f, hand_key) - get_nose(f)) / scale
            pts.append(v)
        arr = np.array(pts, dtype=np.double)
        return arr - arr.mean(axis=0, keepdims=True)

    def score_single_traj(s_arr, b_arr):
        if len(s_arr) == 0 or len(b_arr) == 0:
            return 0
        dist_full = min(
            _dtw_distance(s_arr, b_arr),
            _dtw_distance(s_arr, b_arr * np.array([-1.0, 1.0, 1.0]))
        )
        # DTW step cost normalized by warp path length (len(s) + len(b))
        norm_full = dist_full / (len(s_arr) + len(b_arr))

        n_b = len(b_arr)
        q1 = max(0, int(n_b * 0.20))
        q3 = min(n_b, int(n_b * 0.80) + 1)
        if q3 - q1 >= 2:
            b_apex = b_arr[q1:q3]
            dist_apex = min(
                _dtw_distance(s_arr, b_apex),
                _dtw_distance(s_arr, b_apex * np.array([-1.0, 1.0, 1.0]))
            )
            norm_apex = dist_apex / (len(s_arr) + len(b_apex))
            best_norm = min(norm_full, norm_apex)
        else:
            best_norm = norm_full

        # Step cost scaling: ~0.45 step error gives ~75% score; completely wild flailing gives < 50%
        return max(0, min(100, 100 - (best_norm * 55)))

    if is_b_two and is_s_two:
        # Two-handed motion: calculate both hands and average
        s_r = trajectory(student_seq, "right_hand")
        s_l = trajectory(student_seq, "left_hand")
        b_r = trajectory(baseline_seq, "right_hand")
        b_l = trajectory(baseline_seq, "left_hand")

        direct = (score_single_traj(s_r, b_r) + score_single_traj(s_l, b_l)) / 2.0
        mirror = (score_single_traj(s_r, b_l) + score_single_traj(s_l, b_r)) / 2.0
        return max(direct, mirror)
    else:
        s_full = trajectory(student_seq, "hand")
        b_full = trajectory(baseline_seq, "hand")
        return score_single_traj(s_full, b_full)

def filter_valid_frames(sequence):
    """
    Removes frames where landmarks were not detected:
    - hand missing
    - pose missing
    """
    return [
        f for f in sequence
        if (f.get('hand', [{}])[0].get('x', 0) != 0 or 
            f.get('right_hand', [{}])[0].get('x', 0) != 0 or 
            f.get('left_hand', [{}])[0].get('x', 0) != 0) and 
           f.get('pose', [{}])[0].get('x', 0) != 0
    ]

def evaluate_sign(student_sequence, baseline_sequence):
    """
    Returns the 4 parameter scores.
    """
    s_valid = filter_valid_frames(student_sequence)
    b_valid = filter_valid_frames(baseline_sequence)
    
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
    has_any_hand = (
        frame.get('hand', [{}])[0].get('x', 0) != 0 or
        frame.get('right_hand', [{}])[0].get('x', 0) != 0 or
        frame.get('left_hand', [{}])[0].get('x', 0) != 0
    )
    if not has_any_hand or frame.get('pose', [{}])[0].get('x', 0) == 0:
        return {"handshape": 0, "palmOrientation": 0, "location": 0}
    
    s, b = [frame], [baseline_mid]
    return {
        "handshape": round(calculate_handshape_score(s, b)),
        "palmOrientation": round(calculate_palm_orientation_score(s, b)),
        "location": round(calculate_location_score(s, b)),
    }

