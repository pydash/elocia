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

    # Strict handshape scoring curve:
    # Small differences (<= 0.15): acceptable anatomical variation (100 -> 80)
    # Moderate differences (0.15 - 0.30): partial deformation (80 -> 45)
    # Large differences (> 0.30, e.g. phone grasp vs sign): instant fail (< 45)
    if ext_diff <= 0.15:
        ext_score = 100.0 - (ext_diff * 133.0)
    elif ext_diff <= 0.30:
        ext_score = 80.0 - ((ext_diff - 0.15) * 233.0)
    else:
        ext_score = max(0.0, 45.0 - ((ext_diff - 0.30) * 120.0))

    if spread_diff <= 0.15:
        spread_score = 100.0 - (spread_diff * 133.0)
    elif spread_diff <= 0.30:
        spread_score = 80.0 - ((spread_diff - 0.15) * 233.0)
    else:
        spread_score = max(0.0, 45.0 - ((spread_diff - 0.30) * 120.0))

    return round(max(0.0, min(100.0, min(ext_score, spread_score))), 1)

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
    """
    Computes true anatomical palmar normal vector pointing outwards from the palm.
    - Right hand: cross(index - wrist, pinky - wrist) points outward from the palm.
    - Left hand:  cross(pinky - wrist, index - wrist) points outward from the palm.
    """
    hand = frame.get(hand_key, frame.get("hand", []))
    if not hand or len(hand) < 21:
        return np.array([0.0, 0.0, 1.0])
    wrist = np.array([hand[0]['x'], hand[0]['y'], hand[0]['z']])
    index_mcp = np.array([hand[5]['x'], hand[5]['y'], hand[5]['z']])
    pinky_mcp = np.array([hand[17]['x'], hand[17]['y'], hand[17]['z']])

    v1 = index_mcp - wrist
    v2 = pinky_mcp - wrist

    # Anatomical handedness correction:
    # If explicitly 'left_hand', invert cross product order so the normal vector
    # consistently points in the true palmar direction (away from the palm face).
    if hand_key == "left_hand":
        normal = np.cross(v2, v1)
    else:
        normal = np.cross(v1, v2)

    norm = np.linalg.norm(normal)
    return normal / norm if norm > 0 else np.array([0.0, 0.0, 1.0])

def _windowed_palm_normals(seq, hand_key="hand"):
    """
    Gathers palm normal vectors across the central signing execution window (apex +/- 15%).
    Filters out transient monocular landmark jitter and depth noise.
    """
    n = len(seq)
    if n == 0:
        return [np.array([0.0, 0.0, 1.0])]
    mid = n // 2
    window_half = max(2, int(n * 0.15))
    start_idx = max(0, mid - window_half)
    end_idx = min(n, mid + window_half + 1)
    
    normals = []
    for i in range(start_idx, end_idx):
        f = seq[i]
        hand = f.get(hand_key, f.get("hand", []))
        if hand and len(hand) >= 21 and (hand[0]['x'] != 0 or hand[0]['y'] != 0):
            normals.append(_get_palm_normal_for_hand(f, hand_key))
    if not normals:
        return [_get_palm_normal_for_hand(seq[mid], hand_key)]
    return normals

def calculate_single_palm_score(s_seq, b_seq, s_key="hand", b_key="hand"):
    """
    Windowed palm orientation score comparing representative apex normal vectors.
    Evaluates both direct orientation and mirrored orientation.
    """
    s_normals = _windowed_palm_normals(s_seq, s_key) if isinstance(s_seq, list) else [_get_palm_normal_for_hand(s_seq, s_key)]
    b_normals = _windowed_palm_normals(b_seq, b_key) if isinstance(b_seq, list) else [_get_palm_normal_for_hand(b_seq, b_key)]

    # Compute robust median normal vector for student and baseline
    s_mean = np.mean(s_normals, axis=0)
    s_norm_val = np.linalg.norm(s_mean)
    s_normal = s_mean / s_norm_val if s_norm_val > 0 else np.array([0.0, 0.0, 1.0])

    b_mean = np.mean(b_normals, axis=0)
    b_norm_val = np.linalg.norm(b_mean)
    b_normal = b_mean / b_norm_val if b_norm_val > 0 else np.array([0.0, 0.0, 1.0])

    dot = np.dot(s_normal, b_normal)
    dot = max(-1.0, min(1.0, dot))
    angle1 = np.arccos(dot)

    b_normal_mirrored = np.array([b_normal[0], -b_normal[1], -b_normal[2]])
    dot_mirrored = np.dot(s_normal, b_normal_mirrored)
    dot_mirrored = max(-1.0, min(1.0, dot_mirrored))
    angle2 = np.arccos(dot_mirrored)

    best_angle = min(angle1, angle2)
    angle_deg = best_angle * 180.0 / np.pi

    # Strict palm orientation scoring curve:
    # 0 - 15 degrees: excellent alignment (100 -> 80)
    # 15 - 35 degrees: moderate deviation (80 -> 40)
    # > 35 degrees: unacceptable or reversed orientation (< 40, failing)
    if angle_deg <= 15.0:
        score = 100.0 - (angle_deg * 1.33)
    elif angle_deg <= 35.0:
        score = 80.0 - ((angle_deg - 15.0) * 2.0)
    else:
        score = max(0.0, 40.0 - ((angle_deg - 35.0) * 1.0))

    return round(max(0.0, min(100.0, score)), 1)

def calculate_palm_orientation_score(student_seq, baseline_seq):
    if not student_seq or not baseline_seq: return 0

    is_b_two = is_two_handed_sequence(baseline_seq)
    is_s_two = is_two_handed_sequence(student_seq)

    if is_b_two and is_s_two:
        direct = (calculate_single_palm_score(student_seq, baseline_seq, "right_hand", "right_hand") +
                  calculate_single_palm_score(student_seq, baseline_seq, "left_hand", "left_hand")) / 2.0
        mirror = (calculate_single_palm_score(student_seq, baseline_seq, "right_hand", "left_hand") +
                  calculate_single_palm_score(student_seq, baseline_seq, "left_hand", "right_hand")) / 2.0
        absolute_score = max(direct, mirror)

        # Dual-Hand Relative Palm Orientation Metric (critical for signs like "Book"):
        # Evaluates the angle between the two palms (e.g., facing each other vs open).
        # This is invariant to slight forward/backward body tilt relative to the camera!
        s_r_normals = _windowed_palm_normals(student_seq, "right_hand")
        s_l_normals = _windowed_palm_normals(student_seq, "left_hand")
        b_r_normals = _windowed_palm_normals(baseline_seq, "right_hand")
        b_l_normals = _windowed_palm_normals(baseline_seq, "left_hand")

        s_r_norm = np.mean(s_r_normals, axis=0)
        s_r_norm = s_r_norm / (np.linalg.norm(s_r_norm) or 1.0)
        s_l_norm = np.mean(s_l_normals, axis=0)
        s_l_norm = s_l_norm / (np.linalg.norm(s_l_norm) or 1.0)

        b_r_norm = np.mean(b_r_normals, axis=0)
        b_r_norm = b_r_norm / (np.linalg.norm(b_r_norm) or 1.0)
        b_l_norm = np.mean(b_l_normals, axis=0)
        b_l_norm = b_l_norm / (np.linalg.norm(b_l_norm) or 1.0)

        s_rel_dot = max(-1.0, min(1.0, np.dot(s_r_norm, s_l_norm)))
        b_rel_dot = max(-1.0, min(1.0, np.dot(b_r_norm, b_l_norm)))

        rel_angle_diff = abs(np.arccos(s_rel_dot) - np.arccos(b_rel_dot))
        relative_score = max(0, min(100, 100 - (rel_angle_diff * 180 / np.pi)))

        # Blend: 60% absolute body orientation + 40% dual-hand relative palm orientation
        blended_score = (absolute_score * 0.60) + (relative_score * 0.40)
        return max(absolute_score, blended_score)
    else:
        scores = []
        for s_k in ["hand", "right_hand", "left_hand"]:
            for b_k in ["hand", "right_hand", "left_hand"]:
                scores.append(calculate_single_palm_score(student_seq, baseline_seq, s_k, b_k))
        return max(scores) if scores else 0

def _score_location_distance(dist):
    """
    Strict multi-tier signing location curve.
    dist is measured in normalized shoulder widths (0.0 = exact match):
    - 0.00 to 0.20: within target signing space (100 -> 80)
    - 0.20 to 0.38: outer boundary of target zone (80 -> 40)
    - > 0.38: completely out of location target (ear, phone, lap) (< 40, fail)
    """
    if dist <= 0.20:
        score = 100.0 - (dist * 100.0)
    elif dist <= 0.38:
        score = 80.0 - ((dist - 0.20) * 222.0)
    else:
        score = max(0.0, 40.0 - ((dist - 0.38) * 100.0))
    return round(max(0.0, min(100.0, score)), 1)

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
        return _score_location_distance(total_err)
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
                scores.append(_score_location_distance(best_dist))
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

    def path_displacement(seq, hand_key="hand"):
        pts = [get_wrist(f, hand_key) for f in seq if get_wrist(f, hand_key)[0] != 0]
        if len(pts) < 2:
            return 0.0
        pts_arr = np.array(pts)
        return float(np.sum(np.linalg.norm(np.diff(pts_arr, axis=0), axis=1)))

    def score_single_traj(s_arr, b_arr, s_seq=None, b_seq=None, hand_key="hand"):
        if len(s_arr) == 0 or len(b_arr) == 0:
            return 0

        # Motion Concordance Check:
        # If baseline has significant dynamic movement (> 0.25) but student's hand
        # is virtually stationary (< 0.12, e.g. holding a phone or casual rest),
        # fail movement immediately (< 20%).
        if s_seq is not None and b_seq is not None:
            b_disp = path_displacement(b_seq, hand_key)
            s_disp = path_displacement(s_seq, hand_key)
            if b_disp > 0.25 and s_disp < 0.12:
                # Stationary hand during dynamic sign: fail
                return max(5.0, round((s_disp / (b_disp or 1.0)) * 30.0, 1))

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

        direct = (score_single_traj(s_r, b_r, student_seq, baseline_seq, "right_hand") + 
                  score_single_traj(s_l, b_l, student_seq, baseline_seq, "left_hand")) / 2.0
        mirror = (score_single_traj(s_r, b_l, student_seq, baseline_seq, "right_hand") + 
                  score_single_traj(s_l, b_r, student_seq, baseline_seq, "left_hand")) / 2.0
        return max(direct, mirror)
    else:
        s_full = trajectory(student_seq, "hand")
        b_full = trajectory(baseline_seq, "hand")
        return score_single_traj(s_full, b_full, student_seq, baseline_seq, "hand")

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

