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

def _get_finger_angles(frame, hand_key="hand"):
    """
    Computes 3D joint bend angles (MCP-PIP-DIP) for each finger (Index, Middle, Ring, Pinky).
    These joint angles are invariant to camera perspective (whether hand is front, sideways, or angled).
    Returns array of 4 angles (in radians, from 0 = straight to pi = fully curled).
    """
    hand = frame.get(hand_key, frame.get("hand", []))
    if not hand or len(hand) < 21:
        return np.zeros(4)
    
    # Finger triplets: (MCP, PIP, DIP)
    # Index: 5, 6, 7; Middle: 9, 10, 11; Ring: 13, 14, 15; Pinky: 17, 18, 19
    finger_triplets = [(5, 6, 7), (9, 10, 11), (13, 14, 15), (17, 18, 19)]
    angles = []
    for mcp_i, pip_i, dip_i in finger_triplets:
        mcp = np.array([hand[mcp_i]['x'], hand[mcp_i]['y'], hand[mcp_i]['z']])
        pip = np.array([hand[pip_i]['x'], hand[pip_i]['y'], hand[pip_i]['z']])
        dip = np.array([hand[dip_i]['x'], hand[dip_i]['y'], hand[dip_i]['z']])
        
        v1 = mcp - pip
        v2 = dip - pip
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        if norm1 > 1e-4 and norm2 > 1e-4:
            cos_val = np.dot(v1, v2) / (norm1 * norm2)
            cos_val = max(-1.0, min(1.0, cos_val))
            angle = np.arccos(cos_val)
        else:
            angle = 0.0
        angles.append(angle)
    return np.array(angles)

def _handshape_features_for_hand_window(seq, hand_key, center_ratio=0.5):
    n = len(seq)
    if n == 0:
        return None, None, None
    mid = max(0, min(n - 1, int(n * center_ratio)))
    k = min(9, n)
    idxs = [max(0, min(n - 1, mid - k // 2 + i)) for i in range(k)] if k > 1 else [0]
    
    ext_list, spread_list, angle_list = [], [], []
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
        angle_list.append(_get_finger_angles(f, hand_key))
    if not ext_list:
        return None, None, None
    return np.median(ext_list, axis=0), np.median(spread_list, axis=0), np.median(angle_list, axis=0)

def _handshape_features_for_hand(seq, hand_key):
    return _handshape_features_for_hand_window(seq, hand_key, center_ratio=0.5)

def calculate_single_handshape_score(s_seq, b_seq, s_key="hand", b_key="hand"):
    b_ext, b_spread, b_angles = _handshape_features_for_hand(b_seq, b_key)
    if b_ext is None or b_spread is None:
        return 0

    candidate_ratios = [0.50, 0.35, 0.65] if len(s_seq) >= 8 else [0.50]
    best_score = 0.0

    for ratio in candidate_ratios:
        s_ext, s_spread, s_angles = _handshape_features_for_hand_window(s_seq, s_key, center_ratio=ratio)
        if s_ext is None or s_spread is None:
            continue

        ext_diffs = np.abs(s_ext - b_ext)
        spread_diffs = np.abs(s_spread - b_spread)

        # 60% mean difference + 40% maximum difference
        # Mitigates outlier penalty on a single abducted finger while remaining sensitive to incorrect handshapes
        ext_diff = float(0.60 * np.mean(ext_diffs) + 0.40 * np.max(ext_diffs))
        spread_diff = float(0.60 * np.mean(spread_diffs) + 0.40 * np.max(spread_diffs))

        # 3D Joint Angle difference (perspective-invariant):
        # Normalized so difference in radians / pi gives error 0.0 -> 1.0
        if s_angles is not None and b_angles is not None:
            angle_diffs = np.abs(s_angles - b_angles) / np.pi
            angle_diff = float(0.60 * np.mean(angle_diffs) + 0.40 * np.max(angle_diffs))
        else:
            angle_diff = ext_diff

        effective_ext_diff = min(ext_diff, angle_diff * 0.9)

        # Pedagogical scoring curve:
        # Small differences (<= 0.18): acceptable anatomical variation (100 -> 80)
        # Moderate differences (0.18 - 0.32): partial deformation (80 -> 50)
        # Large differences (> 0.32, e.g. phone grasp vs sign): wrong handshape (< 50)
        if effective_ext_diff <= 0.18:
            ext_score = 100.0 - (effective_ext_diff * 111.0)
        elif effective_ext_diff <= 0.32:
            ext_score = 80.0 - ((effective_ext_diff - 0.18) * 214.0)
        else:
            ext_score = max(0.0, 50.0 - ((effective_ext_diff - 0.32) * 125.0))

        if spread_diff <= 0.18:
            spread_score = 100.0 - (spread_diff * 111.0)
        elif spread_diff <= 0.32:
            spread_score = 80.0 - ((spread_diff - 0.18) * 214.0)
        else:
            spread_score = max(0.0, 50.0 - ((spread_diff - 0.32) * 125.0))

        cand_score = max(0.0, min(100.0, min(ext_score, spread_score)))
        if cand_score > best_score:
            best_score = cand_score

    return round(best_score, 1)

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
    Computes true anatomical palmar normal vector pointing outwards from the palm face.
    - Right hand: cross(index - wrist, pinky - wrist) points outward from the palm face towards camera (-Z).
    - Left hand:  cross(pinky - wrist, index - wrist) points outward from the palm face towards camera (-Z).
    If hand_key is generic "hand", infer handedness from proximity to shoulders in pose.
    """
    hand = frame.get(hand_key, frame.get("hand", []))
    if not hand or len(hand) < 21:
        return np.array([0.0, 0.0, -1.0])
    wrist = np.array([hand[0]['x'], hand[0]['y'], hand[0]['z']])
    index_mcp = np.array([hand[5]['x'], hand[5]['y'], hand[5]['z']])
    pinky_mcp = np.array([hand[17]['x'], hand[17]['y'], hand[17]['z']])

    v1 = index_mcp - wrist
    v2 = pinky_mcp - wrist

    # Determine handedness
    is_left = (hand_key == "left_hand")
    if hand_key == "hand" and frame.get("pose") and len(frame["pose"]) >= 13:
        pose = frame["pose"]
        ls = pose[11]
        rs = pose[12]
        if (ls.get('x', 0) != 0 or rs.get('x', 0) != 0):
            d_ls = (wrist[0] - ls.get('x', 0))**2 + (wrist[1] - ls.get('y', 0))**2
            d_rs = (wrist[0] - rs.get('x', 0))**2 + (wrist[1] - rs.get('y', 0))**2
            is_left = (d_ls < d_rs)

    if is_left:
        normal = np.cross(v2, v1)
    else:
        normal = np.cross(v1, v2)

    norm = np.linalg.norm(normal)
    return normal / norm if norm > 0 else np.array([0.0, 0.0, -1.0])

def _windowed_palm_normals(seq, hand_key="hand"):
    """
    Gathers palm normal vectors across the central signing execution window (apex +/- 15%).
    Filters out transient monocular landmark jitter and depth noise.
    Returns empty list if the requested hand_key is absent in the sequence.
    """
    n = len(seq)
    if n == 0:
        return []
    mid = n // 2
    window_half = max(2, int(n * 0.15))
    start_idx = max(0, mid - window_half)
    end_idx = min(n, mid + window_half + 1)
    
    normals = []
    for i in range(start_idx, end_idx):
        f = seq[i]
        hand = f.get(hand_key)
        if hand and len(hand) >= 21 and any(lm['x'] != 0 or lm['y'] != 0 for lm in hand[:5]):
            normals.append(_get_palm_normal_for_hand(f, hand_key))
            
    # If no window frames had the hand, check if mid frame specifically has it
    if not normals:
        mid_hand = seq[mid].get(hand_key)
        if mid_hand and len(mid_hand) >= 21 and any(lm['x'] != 0 or lm['y'] != 0 for lm in mid_hand[:5]):
            normals.append(_get_palm_normal_for_hand(seq[mid], hand_key))
            
    return normals

def calculate_single_palm_score(s_seq, b_seq, s_key="hand", b_key="hand"):
    """
    Windowed palm orientation score comparing representative apex normal vectors.
    Evaluates both direct orientation and horizontally mirrored orientation.
    Returns None if either sequence lacks landmarks for the specified hand.
    """
    s_normals = _windowed_palm_normals(s_seq, s_key) if isinstance(s_seq, list) else [_get_palm_normal_for_hand(s_seq, s_key)]
    b_normals = _windowed_palm_normals(b_seq, b_key) if isinstance(b_seq, list) else [_get_palm_normal_for_hand(b_seq, b_key)]

    if not s_normals or not b_normals:
        return None

    # Compute robust mean normal vector for student and baseline
    s_mean = np.mean(s_normals, axis=0)
    s_norm_val = np.linalg.norm(s_mean)
    s_normal = s_mean / s_norm_val if s_norm_val > 0 else np.array([0.0, 0.0, -1.0])

    b_mean = np.mean(b_normals, axis=0)
    b_norm_val = np.linalg.norm(b_mean)
    b_normal = b_mean / b_norm_val if b_norm_val > 0 else np.array([0.0, 0.0, -1.0])

    # Direct comparison:
    dot = np.dot(s_normal, b_normal)
    dot = max(-1.0, min(1.0, dot))
    angle1 = np.arccos(dot)

    # Horizontal mirror comparison (flip X axis across sagittal plane; Y and Z point towards viewer):
    b_normal_mirrored = np.array([-b_normal[0], b_normal[1], b_normal[2]])
    dot_mirrored = np.dot(s_normal, b_normal_mirrored)
    dot_mirrored = max(-1.0, min(1.0, dot_mirrored))
    angle2 = np.arccos(dot_mirrored)

    best_angle = min(angle1, angle2)
    angle_deg = best_angle * 180.0 / np.pi

    # Ergonomic palm orientation scoring curve:
    # 0 - 30 degrees: excellent alignment with teacher demo (100 -> 80)
    # 30 - 55 degrees: acceptable learner pitch/yaw variation (80 -> 60)
    # > 55 degrees: reversed orientation / wrong palm face (< 60, triggers scaffolding)
    if angle_deg <= 30.0:
        score = 100.0 - (angle_deg * 0.67)
    elif angle_deg <= 55.0:
        score = 80.0 - ((angle_deg - 30.0) * 0.8)
    else:
        score = max(0.0, 60.0 - ((angle_deg - 55.0) * 1.8))

    return round(max(0.0, min(100.0, score)), 1)

def calculate_palm_orientation_score(student_seq, baseline_seq):
    if not student_seq or not baseline_seq: return 0

    is_b_two = is_two_handed_sequence(baseline_seq)
    is_s_two = is_two_handed_sequence(student_seq)

    if is_b_two and is_s_two:
        direct_r = calculate_single_palm_score(student_seq, baseline_seq, "right_hand", "right_hand")
        direct_l = calculate_single_palm_score(student_seq, baseline_seq, "left_hand", "left_hand")
        mirror_r = calculate_single_palm_score(student_seq, baseline_seq, "right_hand", "left_hand")
        mirror_l = calculate_single_palm_score(student_seq, baseline_seq, "left_hand", "right_hand")
        
        direct = ((direct_r or 0) + (direct_l or 0)) / 2.0
        mirror = ((mirror_r or 0) + (mirror_l or 0)) / 2.0
        absolute_score = max(direct, mirror)

        # Dual-Hand Relative Palm Orientation Metric (critical for signs like "Book"):
        # Evaluates the angle between the two palms (e.g., facing each other vs open).
        # This is invariant to slight forward/backward body tilt relative to the camera!
        s_r_normals = _windowed_palm_normals(student_seq, "right_hand")
        s_l_normals = _windowed_palm_normals(student_seq, "left_hand")
        b_r_normals = _windowed_palm_normals(baseline_seq, "right_hand")
        b_l_normals = _windowed_palm_normals(baseline_seq, "left_hand")

        if s_r_normals and s_l_normals and b_r_normals and b_l_normals:
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
        return absolute_score
    else:
        scores = []
        for s_k in ["hand", "right_hand", "left_hand"]:
            for b_k in ["hand", "right_hand", "left_hand"]:
                sc = calculate_single_palm_score(student_seq, baseline_seq, s_k, b_k)
                if sc is not None:
                    scores.append(sc)
        return max(scores) if scores else 0

def _score_location_distance(dist):
    """
    Child-tolerant signing space location scoring (measured in body shoulder widths):
    - dist <= 0.35: Target core zone (100 -> 85)
    - 0.35 < dist <= 0.65: Natural elementary ergonomic variation (85 -> 70)
    - 0.65 < dist <= 0.80: Acceptable region margin (70 -> 60, passing boundary)
    - dist > 0.80: Out of position / wrong anatomical zone (< 60, fail)
    """
    if dist <= 0.35:
        score = 100.0 - (dist * (15.0 / 0.35))
    elif dist <= 0.65:
        score = 85.0 - ((dist - 0.35) * (15.0 / 0.30))
    elif dist <= 0.80:
        score = 70.0 - ((dist - 0.65) * (10.0 / 0.15))
    else:
        score = max(0.0, 60.0 - ((dist - 0.80) * 120.0))
    return round(max(0.0, min(100.0, score)), 1)

def calculate_location_score(student_seq, baseline_seq):
    if not student_seq or not baseline_seq: return 0

    is_b_two = is_two_handed_sequence(baseline_seq)
    is_s_two = is_two_handed_sequence(student_seq)

    # Use 2D (X, Y) plane for body scale and reference points to eliminate monocular Z depth estimation noise:
    def get_2d_wrist(frame, key="hand"):
        hand = frame.get(key, frame.get("hand", []))
        if hand and len(hand) > 0 and (hand[0]['x'] != 0 or hand[0]['y'] != 0):
            return np.array([hand[0]['x'], hand[0]['y']])

        # Fallback to MediaPipe Pose wrist landmarks (16: Right Wrist, 15: Left Wrist)
        # Prevents location dropping to 0 when rapid hand motion causes temporary hand detector flickering
        pose = frame.get("pose", [])
        if pose and len(pose) > 16:
            if key in ("right_hand", "hand") and (pose[16]['x'] != 0 or pose[16]['y'] != 0):
                return np.array([pose[16]['x'], pose[16]['y']])
            if key in ("left_hand", "hand") and (pose[15]['x'] != 0 or pose[15]['y'] != 0):
                return np.array([pose[15]['x'], pose[15]['y']])
        return None

    def get_2d_nose(frame):
        if not frame.get('pose') or len(frame['pose']) == 0:
            return np.array([0.5, 0.5])
        return np.array([frame['pose'][0]['x'], frame['pose'][0]['y']])

    def get_2d_scale(frame):
        if not frame.get('pose') or len(frame['pose']) < 13:
            return 0.33
        l = np.array([frame['pose'][11]['x'], frame['pose'][11]['y']])
        r = np.array([frame['pose'][12]['x'], frame['pose'][12]['y']])
        w = np.linalg.norm(l - r)
        return float(w) if w > 0.05 else 0.33

    def get_signing_space_vector(frame, key="hand"):
        w = get_2d_wrist(frame, key)
        if w is None:
            return None
        nose = get_2d_nose(frame)
        scale = get_2d_scale(frame)
        return (w - nose) / scale

    def get_hand_trajectory_and_centroid(seq, key="hand"):
        vectors = []
        for f in seq:
            v = get_signing_space_vector(f, key)
            if v is not None:
                vectors.append(v)
        if not vectors:
            return None, None
        vecs_arr = np.array(vectors)
        centroid = np.median(vecs_arr, axis=0)
        return centroid, vecs_arr

    if is_b_two and is_s_two:
        # Two-handed signs: evaluate signing space centroid for both hands
        s_rw_cent, s_rw_pts = get_hand_trajectory_and_centroid(student_seq, "right_hand")
        s_lw_cent, s_lw_pts = get_hand_trajectory_and_centroid(student_seq, "left_hand")
        b_rw_cent, b_rw_pts = get_hand_trajectory_and_centroid(baseline_seq, "right_hand")
        b_lw_cent, b_lw_pts = get_hand_trajectory_and_centroid(baseline_seq, "left_hand")

        # Fallback to generic "hand" if specific keys are missing
        if s_rw_cent is None: s_rw_cent, s_rw_pts = get_hand_trajectory_and_centroid(student_seq, "hand")
        if b_rw_cent is None: b_rw_cent, b_rw_pts = get_hand_trajectory_and_centroid(baseline_seq, "hand")

        if s_rw_cent is None or b_rw_cent is None:
            return 0

        if s_lw_cent is None or b_lw_cent is None:
            dist = np.linalg.norm(s_rw_cent - b_rw_cent)
            return _score_location_distance(dist)

        # Direct vs mirrored placement across body sagittal plane
        dist_direct = (np.linalg.norm(s_rw_cent - b_rw_cent) + np.linalg.norm(s_lw_cent - b_lw_cent)) / 2.0
        b_lw_mirrored = np.array([-b_lw_cent[0], b_lw_cent[1]])
        b_rw_mirrored = np.array([-b_rw_cent[0], b_rw_cent[1]])
        dist_mirror = (np.linalg.norm(s_rw_cent - b_lw_mirrored) + np.linalg.norm(s_lw_cent - b_rw_mirrored)) / 2.0
        best_dist = min(dist_direct, dist_mirror)

        # For dynamic two-handed signs (e.g. Heart), also compare student centroids to baseline trajectory envelopes
        if b_rw_pts is not None and len(b_rw_pts) > 4:
            min_rw = float(np.min([np.linalg.norm(s_rw_cent - pt) for pt in b_rw_pts]))
            min_lw = float(np.min([np.linalg.norm(s_lw_cent - pt) for pt in b_lw_pts]))
            traj_dist = (min_rw + min_lw) / 2.0
            best_dist = min(best_dist, (best_dist + traj_dist) / 2.0)

        # Relative hand separation in shoulder widths with child hand size deadband:
        s_sep = np.linalg.norm(s_rw_cent - s_lw_cent)
        b_sep = np.linalg.norm(b_rw_cent - b_lw_cent)
        sep_diff = abs(s_sep - b_sep)
        effective_sep_diff = max(0.0, sep_diff - 0.12)

        total_err = (best_dist * 0.80) + (effective_sep_diff * 0.20)
        return _score_location_distance(total_err)
    else:
        scores = []
        for s_k in ["hand", "right_hand", "left_hand"]:
            for b_k in ["hand", "right_hand", "left_hand"]:
                s_cent, s_pts = get_hand_trajectory_and_centroid(student_seq, s_k)
                b_cent, b_pts = get_hand_trajectory_and_centroid(baseline_seq, b_k)
                if s_cent is None or b_cent is None:
                    continue

                dist = np.linalg.norm(s_cent - b_cent)
                b_cent_mirrored = np.array([-b_cent[0], b_cent[1]])
                dist_mirrored = np.linalg.norm(s_cent - b_cent_mirrored)
                best_dist = min(dist, dist_mirrored)

                # For dynamic trajectories (like Circle), also compare student centroid to baseline trajectory zone
                if b_pts is not None and len(b_pts) > 4:
                    min_traj_dist = float(np.min([np.linalg.norm(s_cent - pt) for pt in b_pts]))
                    best_dist = min(best_dist, (best_dist + min_traj_dist) / 2.0)

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
        # If baseline has significant dynamic movement (> 0.40) but student's hand
        # has zero movement (< 0.04, e.g. no attempt or hand not moving at all),
        # penalize movement. For static signs (numbers, letters), static hand is natural and valid.
        if s_seq is not None and b_seq is not None:
            b_disp = path_displacement(b_seq, hand_key)
            s_disp = path_displacement(s_seq, hand_key)
            if b_disp > 0.40 and s_disp < 0.04:
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

def extract_active_signing_segment(seq):
    """
    Detects the active signing execution segment by measuring wrist motion energy.
    Trims stationary setup and cooldown frames so dynamic signs performed rapidly
    are accurately aligned with the baseline sequence.
    """
    if not seq or len(seq) < 6:
        return seq

    velocities = []
    for i in range(1, len(seq)):
        w1 = get_wrist(seq[i - 1])
        w2 = get_wrist(seq[i])
        scale = get_shoulder_width(seq[i])
        v = np.linalg.norm(w2[:2] - w1[:2]) / (scale or 0.33)
        velocities.append(v)

    velocities = np.array(velocities)
    peak_v = float(np.max(velocities)) if len(velocities) > 0 else 0.0

    if peak_v > 0.06:
        threshold = max(0.015, peak_v * 0.15)
        moving_indices = np.where(velocities > threshold)[0]
        if len(moving_indices) >= 3:
            start_idx = max(0, moving_indices[0] - 3)
            end_idx = min(len(seq), moving_indices[-1] + 4)
            if end_idx - start_idx >= 6:
                return seq[start_idx:end_idx]

    return seq

def filter_valid_frames(sequence):
    """
    Cleanses and gap-heals the sequence:
    1. Identifies valid frames with pose and hand landmarks.
    2. Interpolates isolated 1-to-3 frame tracking drops caused by motion blur, fast signing, or wrist roll.
    """
    if not sequence:
        return []

    def has_hand(f):
        return (f.get('hand', [{}])[0].get('x', 0) != 0 or 
                f.get('right_hand', [{}])[0].get('x', 0) != 0 or 
                f.get('left_hand', [{}])[0].get('x', 0) != 0)

    def has_pose(f):
        return f.get('pose', [{}])[0].get('x', 0) != 0

    valid_mask = [has_hand(f) and has_pose(f) for f in sequence]

    healed = list(sequence)
    n = len(sequence)
    i = 1
    while i < n - 1:
        if not valid_mask[i]:
            gap_len = 0
            while (i + gap_len < n) and (not valid_mask[i + gap_len]):
                gap_len += 1
            
            if gap_len <= 3 and (i + gap_len < n) and valid_mask[i - 1] and valid_mask[i + gap_len]:
                prev_f = healed[i - 1]
                next_f = healed[i + gap_len]
                for g in range(gap_len):
                    idx = i + g
                    alpha = (g + 1.0) / (gap_len + 1.0)
                    interp_f = {
                        "hand": [],
                        "right_hand": [],
                        "left_hand": [],
                        "has_right": prev_f.get("has_right", False) or next_f.get("has_right", False),
                        "has_left": prev_f.get("has_left", False) or next_f.get("has_left", False),
                        "pose": []
                    }
                    for k in ["hand", "right_hand", "left_hand", "pose"]:
                        p_lms = prev_f.get(k, [])
                        n_lms = next_f.get(k, [])
                        if p_lms and n_lms and len(p_lms) == len(n_lms):
                            interp_f[k] = [
                                {
                                    "x": (1.0 - alpha) * p_lms[j]["x"] + alpha * n_lms[j]["x"],
                                    "y": (1.0 - alpha) * p_lms[j]["y"] + alpha * n_lms[j]["y"],
                                    "z": (1.0 - alpha) * p_lms[j]["z"] + alpha * n_lms[j]["z"]
                                }
                                for j in range(len(p_lms))
                            ]
                        else:
                            interp_f[k] = p_lms or n_lms
                    healed[idx] = interp_f
                    valid_mask[idx] = True
            i += max(1, gap_len)
        else:
            i += 1

    return [healed[j] for j in range(len(healed)) if valid_mask[j]]

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

    s_active = extract_active_signing_segment(s_valid)
    b_active = extract_active_signing_segment(b_valid)

    h_score = calculate_handshape_score(s_active, b_active)
    p_score = calculate_palm_orientation_score(s_active, b_active)
    l_score = calculate_location_score(s_active, b_active)
    m_score = calculate_movement_score(s_active, b_active)

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

