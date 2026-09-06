export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'all' | 'mastery' | 'streak' | 'games' | 'resilience' | 'milestones';
  icon: string;
  color: string;
  borderColor: string;
  maxProgress: number;
  getProgress: (stats: StudentStats) => number;
  formatProgress?: (current: number, max: number) => string;
}

export interface StudentStats {
  streak?: number;
  signs_mastered?: number;
  avg_score?: number;
  stages_complete?: number;
  level?: number;
  grade_level?: number;
  total_xp?: number;
  max_puzzle_streak?: number;
  highest_param_h?: number;
  highest_param_p?: number;
  highest_param_l?: number;
  highest_param_m?: number;
  needs_practice_cleared?: number;
  reviewed_stages_count?: number;
  weekend_practiced?: boolean;
  see_it_rounds?: number;
  magic_fingers_finished?: boolean;
  quick_reflex_achieved?: boolean;
  game_score_500?: boolean;
  improved_sign?: boolean;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
}

export const LEVEL_TIERS: LevelInfo[] = [
  { level: 1,  title: 'Beginner Signer',  minXp: 0,     maxXp: 500 },
  { level: 2,  title: 'Junior Signer',    minXp: 500,   maxXp: 1500 },
  { level: 3,  title: 'Active Signer',    minXp: 1500,  maxXp: 3000 },
  { level: 4,  title: 'Skilled Signer',   minXp: 3000,  maxXp: 5000 },
  { level: 5,  title: 'Star Signer',      minXp: 5000,  maxXp: 7500 },
  { level: 6,  title: 'Honor Signer',     minXp: 7500,  maxXp: 10500 },
  { level: 7,  title: 'Advanced Signer',  minXp: 10500, maxXp: 14000 },
  { level: 8,  title: 'Class Top Signer', minXp: 14000, maxXp: 18000 },
  { level: 9,  title: 'Senior Signer',    minXp: 18000, maxXp: 22500 },
  { level: 10, title: 'Master Signer',    minXp: 22500, maxXp: 30000 },
];

export function getLevelInfo(level: number): LevelInfo {
  const clamped = Math.max(1, Math.min(10, level || 1));
  return LEVEL_TIERS[clamped - 1];
}

export function getLevelTitle(level: number): string {
  return getLevelInfo(level).title;
}

export const ACHIEVEMENTS: Achievement[] = [
  // 1. Handshape Accuracy
  {
    id: 'handshape_accuracy',
    title: 'Handshape Accuracy',
    description: 'Score 90% or higher on Handshape (H)',
    category: 'mastery',
    icon: '\uD83D\uDD90\uFE0F',
    color: '#EFF6FF',
    borderColor: '#3B82F6',
    maxProgress: 90,
    getProgress: (s) => Math.min(90, Math.round(s.highest_param_h ?? ((s.avg_score ?? 0) >= 85 ? 90 : 0))),
    formatProgress: (c, m) => `${c}% / ${m}%`
  },
  // 2. Palm Direction
  {
    id: 'palm_direction',
    title: 'Palm Direction',
    description: 'Score 90% or higher on Palm Orientation (P)',
    category: 'mastery',
    icon: '\uD83E\uDDED',
    color: '#F5F3FF',
    borderColor: '#8B5CF6',
    maxProgress: 90,
    getProgress: (s) => Math.min(90, Math.round(s.highest_param_p ?? ((s.avg_score ?? 0) >= 88 ? 90 : 0))),
    formatProgress: (c, m) => `${c}% / ${m}%`
  },
  // 3. Correct Location
  {
    id: 'correct_location',
    title: 'Correct Location',
    description: 'Score 90% or higher on Location (L)',
    category: 'mastery',
    icon: '\uD83C\uDFAF',
    color: '#ECFDF5',
    borderColor: '#10B981',
    maxProgress: 90,
    getProgress: (s) => Math.min(90, Math.round(s.highest_param_l ?? ((s.avg_score ?? 0) >= 80 ? 90 : 0))),
    formatProgress: (c, m) => `${c}% / ${m}%`
  },
  // 4. Smooth Movement
  {
    id: 'smooth_movement',
    title: 'Smooth Movement',
    description: 'Score 90% or higher on Movement (M)',
    category: 'mastery',
    icon: '\u2728',
    color: '#FFFBEB',
    borderColor: '#F59E0B',
    maxProgress: 90,
    getProgress: (s) => Math.min(90, Math.round(s.highest_param_m ?? ((s.avg_score ?? 0) >= 90 ? 92 : 0))),
    formatProgress: (c, m) => `${c}% / ${m}%`
  },
  // 5. Clean Signing
  {
    id: 'clean_signing',
    title: 'Clean Signing',
    description: 'Score 85% or higher across all 4 sign parameters',
    category: 'mastery',
    icon: '\uD83C\uDF1F',
    color: '#FEF3C7',
    borderColor: '#F59E0B',
    maxProgress: 85,
    getProgress: (s) => Math.min(85, Math.round(s.avg_score ?? 0)),
    formatProgress: (c, m) => `${c}% / ${m}%`
  },

  // 6. First Practice
  {
    id: 'first_practice',
    title: 'First Practice',
    description: 'Finish your very first lesson session',
    category: 'streak',
    icon: '\uD83C\uDF31',
    color: '#F0FDF4',
    borderColor: '#22C55E',
    maxProgress: 1,
    getProgress: (s) => ((s.stages_complete ?? 0) > 0 || (s.streak ?? 0) > 0 ? 1 : 0),
    formatProgress: (c, m) => `${c} / ${m}`
  },
  // 7. 3-Day Streak
  {
    id: 'three_day_streak',
    title: '3-Day Streak',
    description: 'Practice signs 3 days in a row',
    category: 'streak',
    icon: '\uD83E\uDD49',
    color: '#FFF7ED',
    borderColor: '#EA580C',
    maxProgress: 3,
    getProgress: (s) => Math.min(3, s.streak ?? 0),
    formatProgress: (c, m) => `${c} / ${m} Days`
  },
  // 8. 7-Day Streak
  {
    id: 'seven_day_streak',
    title: '7-Day Streak',
    description: 'Practice signs 7 days in a row',
    category: 'streak',
    icon: '\uD83D\uDD25',
    color: '#FFF1F2',
    borderColor: '#E11D48',
    maxProgress: 7,
    getProgress: (s) => Math.min(7, s.streak ?? 0),
    formatProgress: (c, m) => `${c} / ${m} Days`
  },
  // 9. 10-Day Streak
  {
    id: 'ten_day_streak',
    title: '10-Day Streak',
    description: 'Reach an impressive 10-day streak',
    category: 'streak',
    icon: '\u26A1',
    color: '#FEF2F2',
    borderColor: '#EF4444',
    maxProgress: 10,
    getProgress: (s) => Math.min(10, s.streak ?? 0),
    formatProgress: (c, m) => `${c} / ${m} Days`
  },
  // 10. Weekend Practice
  {
    id: 'weekend_practice',
    title: 'Weekend Practice',
    description: 'Complete a practice lesson on Saturday or Sunday',
    category: 'streak',
    icon: '\uD83C\uDF1E',
    color: '#FEF9C3',
    borderColor: '#EAB308',
    maxProgress: 1,
    getProgress: (s) => (s.weekend_practiced ? 1 : 0),
    formatProgress: (c, m) => `${c} / ${m}`
  },

  // 11. Puzzle Sign Streak
  {
    id: 'puzzle_sign_streak',
    title: 'Puzzle Sign Streak',
    description: 'Answer 5 rounds correctly in a row in Puzzle Sign',
    category: 'games',
    icon: '\uD83E\uDDE9',
    color: '#FAF5FF',
    borderColor: '#A855F7',
    maxProgress: 5,
    getProgress: (s) => Math.min(5, s.max_puzzle_streak ?? 0),
    formatProgress: (c, m) => `${c} / ${m} Streak`
  },
  // 12. Picture Matcher
  {
    id: 'picture_matcher',
    title: 'Picture Matcher',
    description: 'Finish 5 rounds in See It Sign It',
    category: 'games',
    icon: '\uD83D\uDC41\uFE0F',
    color: '#EFF6FF',
    borderColor: '#0284C7',
    maxProgress: 5,
    getProgress: (s) => Math.min(5, s.see_it_rounds ?? 0),
    formatProgress: (c, m) => `${c} / ${m} Rounds`
  },
  // 13. Word Speller
  {
    id: 'word_speller',
    title: 'Word Speller',
    description: 'Finish a Magic Fingers spelling challenge',
    category: 'games',
    icon: '\uD83E\uDE84',
    color: '#FDF2F8',
    borderColor: '#EC4899',
    maxProgress: 1,
    getProgress: (s) => (s.magic_fingers_finished ? 1 : 0),
    formatProgress: (c, m) => `${c} / ${m}`
  },
  // 14. Fast Answer
  {
    id: 'fast_answer',
    title: 'Fast Answer',
    description: 'Sign correctly within the 3-second recording window',
    category: 'games',
    icon: '\uD83D\uDE80',
    color: '#EEF2FF',
    borderColor: '#6366F1',
    maxProgress: 1,
    getProgress: (s) => (s.quick_reflex_achieved || (s.max_puzzle_streak ?? 0) >= 3 ? 1 : 0),
    formatProgress: (c, m) => `${c} / ${m}`
  },
  // 15. Game Score 500
  {
    id: 'game_score_500',
    title: 'Game Score 500',
    description: 'Reach the 500 XP maximum cap in any mini-game',
    category: 'games',
    icon: '\uD83C\uDFC6',
    color: '#FEF3C7',
    borderColor: '#D97706',
    maxProgress: 500,
    getProgress: (s) => (s.game_score_500 ? 500 : Math.min(500, (s.max_puzzle_streak ?? 0) * 100)),
    formatProgress: (c, m) => `${c} / ${m} XP`
  },

  // 16. Sign Improvement
  {
    id: 'sign_improvement',
    title: 'Sign Improvement',
    description: 'Pass a sign that was listed under Needs Practice',
    category: 'resilience',
    icon: '\uD83D\uDEE1\uFE0F',
    color: '#ECFDF5',
    borderColor: '#059669',
    maxProgress: 1,
    getProgress: (s) => (s.improved_sign || (s.needs_practice_cleared ?? 0) > 0 ? 1 : 0),
    formatProgress: (c, m) => `${c} / ${m}`
  },
  // 17. Drill Complete
  {
    id: 'drill_complete',
    title: 'Drill Complete',
    description: 'Complete 4 cards in the Keep Practicing section',
    category: 'resilience',
    icon: '\uD83D\uDCCB',
    color: '#FFF7ED',
    borderColor: '#F97316',
    maxProgress: 4,
    getProgress: (s) => Math.min(4, s.needs_practice_cleared ?? 0),
    formatProgress: (c, m) => `${c} / ${m} Cards`
  },
  // 18. Stage Review
  {
    id: 'stage_review',
    title: 'Stage Review',
    description: 'Replay and pass 3 timeline stages you previously finished',
    category: 'resilience',
    icon: '\uD83D\uDD04',
    color: '#F0FDF4',
    borderColor: '#16A34A',
    maxProgress: 3,
    getProgress: (s) => Math.min(3, s.reviewed_stages_count ?? 0),
    formatProgress: (c, m) => `${c} / ${m} Stages`
  },

  // 19. 15 Signs Mastered
  {
    id: 'fifteen_signs_mastered',
    title: '15 Signs Mastered',
    description: 'Successfully master 15 Filipino Sign Language signs',
    category: 'milestones',
    icon: '\uD83D\uDCDA',
    color: '#F8FAFC',
    borderColor: '#64748B',
    maxProgress: 15,
    getProgress: (s) => Math.min(15, s.signs_mastered ?? 0),
    formatProgress: (c, m) => `${c} / ${m} Signs`
  },
  // 20. Level 5 Achieved
  {
    id: 'level_5_achieved',
    title: 'Level 5 Achieved',
    description: 'Reach Level 5 (Star Signer) by earning 5,000 total XP',
    category: 'milestones',
    icon: '\uD83D\uDC51',
    color: '#FEF9C3',
    borderColor: '#CA8A04',
    maxProgress: 5,
    getProgress: (s) => Math.min(5, s.level ?? 1),
    formatProgress: (c, m) => `Level ${c} / ${m}`
  }
];

export function loadStudentStats(baseStudent?: Partial<StudentStats>): StudentStats {
  const stats: StudentStats = {
    streak: baseStudent?.streak ?? 0,
    signs_mastered: baseStudent?.signs_mastered ?? 0,
    avg_score: baseStudent?.avg_score ?? 0,
    stages_complete: baseStudent?.stages_complete ?? 0,
    level: baseStudent?.level ?? 1,
    grade_level: baseStudent?.grade_level ?? 1,
    total_xp: baseStudent?.total_xp ?? 0,
    max_puzzle_streak: 0,
    highest_param_h: 0,
    highest_param_p: 0,
    highest_param_l: 0,
    highest_param_m: 0,
    needs_practice_cleared: 0,
    reviewed_stages_count: 0,
    weekend_practiced: false,
    see_it_rounds: 0,
    magic_fingers_finished: false,
    quick_reflex_achieved: false,
    game_score_500: false,
    improved_sign: false,
  };

  try {
    const rawPuzzle = localStorage.getItem('elocia_puzzle_streak');
    if (rawPuzzle) stats.max_puzzle_streak = parseInt(rawPuzzle, 10);

    const rawH = localStorage.getItem('elocia_highest_h');
    if (rawH) stats.highest_param_h = parseFloat(rawH);

    const rawP = localStorage.getItem('elocia_highest_p');
    if (rawP) stats.highest_param_p = parseFloat(rawP);

    const rawL = localStorage.getItem('elocia_highest_l');
    if (rawL) stats.highest_param_l = parseFloat(rawL);

    const rawM = localStorage.getItem('elocia_highest_m');
    if (rawM) stats.highest_param_m = parseFloat(rawM);

    const rawReviewed = localStorage.getItem('elocia_reviewed_stages');
    if (rawReviewed) stats.reviewed_stages_count = JSON.parse(rawReviewed).length;

    const rawNeedsPractice = localStorage.getItem('elocia_cleared_needs_practice');
    if (rawNeedsPractice) stats.needs_practice_cleared = parseInt(rawNeedsPractice, 10);

    if (localStorage.getItem('elocia_weekend_practiced') === 'true') {
      stats.weekend_practiced = true;
    }

    const rawSeeIt = localStorage.getItem('elocia_see_it_rounds');
    if (rawSeeIt) stats.see_it_rounds = parseInt(rawSeeIt, 10);

    if (localStorage.getItem('elocia_magic_fingers_finished') === 'true') {
      stats.magic_fingers_finished = true;
    }

    if (localStorage.getItem('elocia_quick_reflex') === 'true') {
      stats.quick_reflex_achieved = true;
    }

    if (localStorage.getItem('elocia_game_score_500') === 'true') {
      stats.game_score_500 = true;
    }

    if (localStorage.getItem('elocia_improved_sign') === 'true') {
      stats.improved_sign = true;
    }
  } catch (e) {
    console.warn('Error reading extra stats from localStorage:', e);
  }

  return stats;
}
