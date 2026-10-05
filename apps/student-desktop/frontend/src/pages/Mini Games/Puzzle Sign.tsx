import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { saveMiniGameScore, fetchMiniGameActivities, resolveMediaUrl } from '../../utils/api';
import CameraSetup from '../Setup/CameraSetup';
import MiniGameComplete from '../MiniGameComplete/MiniGameComplete';
import './Puzzle Sign.css';
import '../../pages/Evaluation/EvaluationSession.css';
import { startPuzzleSignTour, stopCurrentTour } from '../../utils/activityTours';

interface PuzzleSignProps {
  onNavigate: (view: 'navigation' | 'setup' | 'evaluation' | 'stageComplete' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign') => void;
}

const puzzleSignLogo = '/images/Puzzle Sign.png';
const wonderMascot = '/images/Wonder.png';
const amazingMascot = '/images/Amazing.png';
const cloud1Img = '/images/Cloud 1.png';
const backButtonImg = '/images/Back Button.png';
const confettiImg = '/images/Confetti.png';

// ============================================================
// Round Data
// Mirrors what the teacher dashboard will upload per round:
// image1 (given item) + ? (the student signs this answer) = image3 (result).
// Emoji are placeholders until the teacher uploads real images;
// `answer` maps to baselines/baseline_<answer>.json on the CV engine.
// ============================================================
export interface PuzzleRound {
  image1: string;      // left item
  answer: number;     // the missing number -> stageId for baseline lookup
  image3: string;      // result item
  instruction: string; // shown in the instruction card
  answerText?: string; // Optional manual override for the text string displayed
  referenceVideoUrl?: string | null;
}

const PUZZLE_ACTIVITIES: Record<number, PuzzleRound[]> = {
  1: [
    { image1: "☀️", answer: 1, image3: "🌤", instruction: "Sun + ? = Sun behind a cloud" },
    { image1: "1️⃣", answer: 1, image3: "2️⃣", instruction: "One + ? = Two" },
    { image1: "🐟", answer: 1, image3: "🐟🐟", instruction: "Fish + ? = Two fish" },
    { image1: "⭐", answer: 1, image3: "⭐⭐", instruction: "Star + ? = Two stars" },
    { image1: "🍎", answer: 1, image3: "🍎🍎", instruction: "Apple + ? = Two apples" },
    { image1: "☁️", answer: 1, image3: "🌤", instruction: "Cloud + ? = Sun behind a cloud" },
    { image1: "1️⃣", answer: 1, image3: "1️⃣", instruction: "One + ? = One" },
    { image1: "🍪", answer: 1, image3: "🍪🍪", instruction: "Cookie + ? = Two cookies" },
    { image1: "🎈", answer: 1, image3: "🎈🎈", instruction: "Balloon + ? = Two balloons" },
    { image1: "🌙", answer: 1, image3: "🌙🌙", instruction: "Moon + ? = Two moons" },
  ],
  2: [
    { image1: "🍎", answer: 2, image3: "🍎🍎🍎", instruction: "Apple + ? = Three apples" },
    { image1: "1️⃣", answer: 2, image3: "3️⃣", instruction: "One + ? = Three" },
    { image1: "🐟", answer: 2, image3: "🐟🐟🐟", instruction: "Fish + ? = Three fish" },
    { image1: "⭐", answer: 2, image3: "⭐⭐⭐", instruction: "Star + ? = Three stars" },
    { image1: "🎈", answer: 2, image3: "🎈🎈🎈", instruction: "Balloon + ? = Three balloons" },
    { image1: "☁️", answer: 2, image3: "☁️☁️☁️", instruction: "Cloud + ? = Three clouds" },
    { image1: "🌙", answer: 2, image3: "🌙🌙🌙", instruction: "Moon + ? = Three moons" },
    { image1: "🍪", answer: 2, image3: "🍪🍪🍪", instruction: "Cookie + ? = Three cookies" },
    { image1: "☀️", answer: 2, image3: "☀️☀️☀️", instruction: "Sun + ? = Three suns" },
    { image1: "2️⃣", answer: 2, image3: "2️⃣", instruction: "Two + ? = Two" },
  ],
  3: [
    { image1: "🍎", answer: 3, image3: "🍎🍎🍎🍎", instruction: "Apple + ? = Four apples" },
    { image1: "1️⃣", answer: 3, image3: "4️⃣", instruction: "One + ? = Four" },
    { image1: "🐟", answer: 3, image3: "🐟🐟🐟🐟", instruction: "Fish + ? = Four fish" },
    { image1: "⭐", answer: 3, image3: "⭐⭐⭐⭐", instruction: "Star + ? = Four stars" },
    { image1: "🎈", answer: 3, image3: "🎈🎈🎈🎈", instruction: "Balloon + ? = Four balloons" },
    { image1: "☁️", answer: 3, image3: "☁️☁️☁️☁️", instruction: "Cloud + ? = Four clouds" },
    { image1: "🌙", answer: 3, image3: "🌙🌙🌙🌙", instruction: "Moon + ? = Four moons" },
    { image1: "3️⃣", answer: 3, image3: "3️⃣", instruction: "Three + ? = Three" },
    { image1: "🍪", answer: 3, image3: "🍪🍪🍪🍪", instruction: "Cookie + ? = Four cookies" },
    { image1: "☀️", answer: 3, image3: "☀️☀️☀️☀️", instruction: "Sun + ? = Four suns" },
  ],
  4: [
    { image1: "🍎", answer: 4, image3: "🍎🍎🍎🍎🍎", instruction: "Apple + ? = Five apples" },
    { image1: "1️⃣", answer: 4, image3: "5️⃣", instruction: "One + ? = Five" },
    { image1: "🐟", answer: 4, image3: "🐟🐟🐟🐟🐟", instruction: "Fish + ? = Five fish" },
    { image1: "⭐", answer: 4, image3: "⭐⭐⭐⭐⭐", instruction: "Star + ? = Five stars" },
    { image1: "🎈", answer: 4, image3: "🎈🎈🎈🎈🎈", instruction: "Balloon + ? = Five balloons" },
    { image1: "☁️", answer: 4, image3: "☁️☁️☁️☁️☁️", instruction: "Cloud + ? = Five clouds" },
    { image1: "🌙", answer: 4, image3: "🌙🌙🌙🌙🌙", instruction: "Moon + ? = Five moons" },
    { image1: "4️⃣", answer: 4, image3: "4️⃣", instruction: "Four + ? = Four" },
    { image1: "🍪", answer: 4, image3: "🍪🍪🍪🍪🍪", instruction: "Cookie + ? = Five cookies" },
    { image1: "☀️", answer: 4, image3: "☀️☀️☀️☀️☀️", instruction: "Sun + ? = Five suns" },
  ],
};

const HIGHEST_SCORE = 300;

// Same passing rule as the Evaluation module: composite >= 60
// AND no single parameter below 60 (veto rule).
const PASS_THRESHOLD = 60;
const MAX_ATTEMPTS = 3;

interface ScoreSet {
  handshape: number;
  palmOrientation: number;
  location: number;
  movement: number;
}

const MISSING_BASELINE_MSG = "This round's reference is missing. Ask your teacher to upload it!";

export default function PuzzleSign({ onNavigate }: PuzzleSignProps) {
  const [view, setView] = useState<'menu' | 'camera-check' | 'game' | 'results'>('menu');
  const [activeActivity, setActiveActivity] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ---- Game state ----
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0); // Added streak tracking
  const [attempts, setAttempts] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState<{ passed: boolean; overall: number; scores: ScoreSet } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [baselineError, setBaselineError] = useState<string | null>(null);
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  // Auto-evaluation engine state matching EvaluationSession
  type AutoState = 'idle' | 'ready' | 'signing' | 'grading' | 'cooldown' | 'passed';
  const [autoState, setAutoState] = useState<AutoState>('idle');
  const autoStateRef = useRef<AutoState>('idle');
  const holdStartRef = useRef<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<number | null>(null);
  const consecutiveMissRef = useRef(0);
  const hasPassedRef = useRef(false);

  const isEvaluatingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const recordingTimerRef = useRef<number | null>(null);
  const autoNextTimerRef = useRef<number | null>(null);

  const [puzzleActivities, setPuzzleActivities] = useState<Record<number, PuzzleRound[]>>(PUZZLE_ACTIVITIES);
  const [activityTitles, setActivityTitles] = useState<Record<number, string>>({});

  useEffect(() => {
    async function loadDynamicPuzzleActivities() {
      const dynamic = await fetchMiniGameActivities('puzzle_sign');
      if (dynamic && dynamic.length > 0) {
        const mappedDict: Record<number, PuzzleRound[]> = {};
        const titlesDict: Record<number, string> = {};

        dynamic.forEach((act, actIdx) => {
          const actNumber = actIdx + 1;
          titlesDict[actNumber] = act.title;
          if (act.puzzle_sign_items && act.puzzle_sign_items.length > 0) {
            mappedDict[actNumber] = act.puzzle_sign_items.map((item) => {
              const numAnswer = parseInt(item.hidden_word, 10);
              return {
                image1: resolveMediaUrl(item.word_one_image_url) || item.word_one,
                answer: !isNaN(numAnswer) ? numAnswer : 1,
                image3: resolveMediaUrl(item.word_form_image_url) || item.word_form,
                instruction: `${item.word_one} + ? = ${item.word_form}`,
                answerText: item.hidden_word,
                referenceVideoUrl: resolveMediaUrl(item.reference_video_url),
              };
            });
          }
        });

        if (Object.keys(mappedDict).length > 0) {
          setPuzzleActivities(mappedDict);
          setActivityTitles(titlesDict);
        }
      }
    }
    loadDynamicPuzzleActivities();
  }, []);

  const rounds = activeActivity != null ? (puzzleActivities[activeActivity] ?? PUZZLE_ACTIVITIES[activeActivity] ?? []) : [];
  const currentRound = rounds[roundIndex];
  const currentAnswer = currentRound?.answer ?? 1;

  const roundPassed = lastResult?.passed === true;
  const answerShown = roundPassed || revealed;
  const maxedAttempts = attempts >= MAX_ATTEMPTS && !roundPassed && !revealed;

  // ============================================================
  // Handlers
  // ============================================================
    const handleStartActivity = (id: number) => {
      setActiveActivity(id);
      setRoundIndex(0);
      setScore(0);
      setStreak(0);
      setAttempts(0);
      setLastResult(null);
      setRevealed(false);
      setBaselineError(null);
      setShowDemoVideo(false);
      setView('camera-check');
    };

  const currentRoundRef = useRef(currentRound);
  useEffect(() => { currentRoundRef.current = currentRound; }, [currentRound]);

  const handleNextRound = () => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    hasPassedRef.current = false;
    setAutoState('idle');
    autoStateRef.current = 'idle';
    setHoldProgress(0);
    holdStartRef.current = null;
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    if (roundIndex < rounds.length - 1) {
      setRoundIndex(prev => prev + 1);
      setAttempts(0);
      setLastResult(null);
      setRevealed(false);
      setBaselineError(null);
      setShowDemoVideo(false);
    } else {
      const student = JSON.parse(localStorage.getItem('elocia_current_student') || '{}');
      if (student.id) {
        // Capped at 500 XP max for mini games
        const finalXp = Math.min(500, score);
        saveMiniGameScore({
          student_id: student.id,
          game_type: 'puzzle_sign',
          score: finalXp,
          streak: streak,
          rounds_completed: rounds.length
        });
      }
      setView('results');
    }
  };

  const giveUpReveal = () => {
    // After 3 failed attempts the student can reveal the answer
    setRevealed(true);
    setShowDemoVideo(true);
    setBaselineError(null);
  };

  // Dev helper callable from the browser console (same convention as
  // EvaluationSession's forceTier1..4 helpers) — jumps straight into the
  // game view so the grading loop can be tested without redoing camera setup.
  const psStartGame = (activity: number = 1) => {
    setActiveActivity(activity);
    setView('game');
  };
  Object.assign(window, { psStartGame });

  // Keep refs in sync so WebSocket listener always accesses latest state without reconnecting
  const streakRef = useRef(streak);
  const scoreRef = useRef(score);
  const roundIndexRef = useRef(roundIndex);
  const attemptsRef = useRef(attempts);

  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { roundIndexRef.current = roundIndex; }, [roundIndex]);
  useEffect(() => { attemptsRef.current = attempts; }, [attempts]);

  useEffect(() => {
    isEvaluatingRef.current = isEvaluating;
  }, [isEvaluating]);

  useEffect(() => {
    if (view === 'game') {
      startPuzzleSignTour();
    }
    return () => {
      stopCurrentTour();
    };
  }, [view]);

  // ============================================================
  // WebSocket + Camera (mirrors EvaluationSession's /ws/evaluate flow)
  // Runs while the game view is mounted; cleans up on exit.
  // ============================================================
  useEffect(() => {
    if (view !== 'game') return;

    let stream: MediaStream | null = null;
    let cancelled = false;

    async function enableCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        if (!cancelled && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Webcam access failed:', err);
      }
    }
    enableCamera();

    const ws = new WebSocket('ws://127.0.0.1:8001/ws/evaluate');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === 'error' || data.error) {
          setIsEvaluating(false);
          setAutoState('idle');
          autoStateRef.current = 'idle';
          setHoldProgress(0);
          holdStartRef.current = null;
          setBaselineError(data.error || MISSING_BASELINE_MSG);
          return;
        }

        if (data.action === 'result') {
          const scores: ScoreSet = data.scores;
          const overall = data.overall;
          const passed =
            overall >= PASS_THRESHOLD &&
            scores.handshape >= PASS_THRESHOLD &&
            scores.palmOrientation >= PASS_THRESHOLD &&
            scores.location >= PASS_THRESHOLD &&
            scores.movement >= PASS_THRESHOLD;

          setIsEvaluating(false);
          setLastResult({ passed, overall, scores });
          setAttempts(prev => prev + 1);

          const currentStreak = streakRef.current;
          let earned = 0;

          if (passed) {
            hasPassedRef.current = true;
            setAutoState('passed');
            autoStateRef.current = 'passed';
            setBaselineError(null);

            const multiplier = 1 + (currentStreak * 0.2);
            earned = Math.round(overall * multiplier);
            setScore(prev => {
              const nextScore = prev + earned;
              if (nextScore >= 500) {
                try {
                  localStorage.setItem('elocia_game_score_500', 'true');
                } catch (err) {
                  console.warn('Failed to save game_score_500:', err);
                }
              }
              return nextScore;
            });
            setStreak(prev => {
              const nextStreak = prev + 1;
              try {
                const savedMax = parseInt(localStorage.getItem('elocia_puzzle_streak') || '0', 10);
                if (nextStreak > savedMax) {
                  localStorage.setItem('elocia_puzzle_streak', nextStreak.toString());
                }
              } catch (err) {
                console.warn('Failed to save puzzle streak:', err);
              }
              return nextStreak;
            });

            // Automatically advance to the next round after celebration (2.5s)
            if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
            autoNextTimerRef.current = window.setTimeout(() => {
              handleNextRound();
            }, 2500);
          } else {
            hasPassedRef.current = false;
            setStreak(0); // Reset streak on incorrect sign
            setAutoState('cooldown');
            autoStateRef.current = 'cooldown';
            setHoldProgress(0);
            holdStartRef.current = null;
            setCooldownRemaining(2);

            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
            let rem = 2;
            cooldownTimerRef.current = window.setInterval(() => {
              rem -= 1;
              setCooldownRemaining(rem);
              if (rem <= 0) {
                if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
                if (!hasPassedRef.current) {
                  setAutoState('idle');
                  autoStateRef.current = 'idle';
                }
              }
            }, 1000);
          }
        } else if (data.action === 'landmarks' || data.action === 'hand_status') {
          // Automatic hand detection engine identical to Lesson Proper
          const isHandDetected = Boolean(
            data.hand_detected ||
            (data.hand && data.hand[0] && data.hand[0].x !== 0)
          );

          if (hasPassedRef.current || autoStateRef.current === 'grading' || autoStateRef.current === 'cooldown' || autoStateRef.current === 'passed') {
            return;
          }

          if (isHandDetected) {
            consecutiveMissRef.current = 0;
            if (autoStateRef.current === 'idle') {
              setAutoState('ready');
              autoStateRef.current = 'ready';
              holdStartRef.current = Date.now();
              setHoldProgress(0);
            } else if (autoStateRef.current === 'ready') {
              const elapsed = Date.now() - (holdStartRef.current || Date.now());
              const READY_DURATION = 1000; // 1s ready countdown
              const progress = Math.min(100, Math.round((elapsed / READY_DURATION) * 100));
              setHoldProgress(progress);

              if (elapsed >= READY_DURATION) {
                // Transition into active dynamic signing window!
                setAutoState('signing');
                autoStateRef.current = 'signing';
                holdStartRef.current = Date.now();
                setHoldProgress(0);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ action: 'clear' }));
                }
              }
            } else if (autoStateRef.current === 'signing') {
              const elapsed = Date.now() - (holdStartRef.current || Date.now());
              const SIGN_DURATION = 2800; // 2.8 seconds active movement recording window
              const progress = Math.min(100, Math.round((elapsed / SIGN_DURATION) * 100));
              setHoldProgress(progress);

              if (elapsed >= SIGN_DURATION) {
                setAutoState('grading');
                autoStateRef.current = 'grading';
                setIsEvaluating(true);
                holdStartRef.current = null;

                const curR = currentRoundRef.current;
                if (ws.readyState === WebSocket.OPEN && curR) {
                  ws.send(JSON.stringify({ 
                    action: 'evaluate', 
                    stageId: curR.answer,
                    stageName: curR.answerText || `Number ${curR.answer}`,
                    activityType: 'puzzle_sign'
                  }));
                }
              }
            }
          } else {
            if (autoStateRef.current === 'ready') {
              consecutiveMissRef.current += 1;
              if (consecutiveMissRef.current >= 3) {
                setAutoState('idle');
                autoStateRef.current = 'idle';
                setHoldProgress(0);
                holdStartRef.current = null;
              }
            }
          }
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    // Stream frames to the CV engine while the game is mounted
    const interval = setInterval(() => {
      if (
        ws.readyState === WebSocket.OPEN &&
        videoRef.current &&
        videoRef.current.videoWidth > 0 &&
        !isEvaluatingRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64Data = canvas.toDataURL('image/jpeg', 0.5);
          ws.send(JSON.stringify({ image: base64Data }));
        }
      }
    }, 140);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
        autoNextTimerRef.current = null;
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      setIsEvaluating(false);
    };
  }, [view]);

  // ============================================================
  // Renderers
  // ============================================================
  const renderMenu = () => {
    const query = searchQuery.trim().toLowerCase();
    const filteredActivities = [1, 2, 3, 4].filter(num =>
      `activity ${num}`.includes(query)
    );

    return (
      <div className="ps-layout">
        <Sidebar activeTab="practice" onNavigate={onNavigate} />
        <main className="ps-main-menu">
          <div className="ps-bg-watermark"></div>

          <div className="ps-menu-content">
            <img src={puzzleSignLogo} alt="Puzzle Sign" className="ps-logo" />

            <div className="ps-activity-box">
              <div className="ps-search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="ps-activities">
                {filteredActivities.map((num) => (
                  <button
                    key={num}
                    className="ps-activity-btn"
                    onClick={() => handleStartActivity(num)}
                  >
                    <div className="activity-number">{num}</div>
                    <span className="activity-text">{activityTitles[num] || `Activity ${num}`}</span>
                    <span className="activity-arrow">➔</span>
                  </button>
                ))}
                {filteredActivities.length === 0 && (
                  <div className="ps-no-results">No activities found</div>
                )}
              </div>
            </div>

            <button className="ps-back-btn" onClick={() => onNavigate('practice')}>
              &lt; Back to Practice
            </button>
          </div>
        </main>
      </div>
    );
  };

  const renderGame = () => (
    <div className="evaluation-layout-1920">
      {roundPassed && (
        <img src={confettiImg} alt="Confetti" className="global-confetti-overlay" />
      )}

      <header className="eval-header-bar">
        <button className="eval-back-btn" onClick={(e) => { e.preventDefault(); setView('menu'); }} type="button" aria-label="Back">
          <img src={backButtonImg} alt="Back" />
        </button>
        <div className="eval-title-block">
          <div className="eval-main-title">
            Activity {activeActivity}
          </div>
          <div className="eval-progress-track">
            {rounds.map((_, index) => (
              <div key={index} className={`eval-progress-pill ${index < roundIndex + 1 ? 'done' : ''}`} />
            ))}
          </div>
        </div>
        <div className="eval-header-right">
          <span className="eval-counter-text">{roundIndex + 1} of {rounds.length}</span>
          <button 
            className="eval-tour-toggle" 
            type="button" 
            title="Start Activity Guide"
            onClick={() => startPuzzleSignTour()}
          >
            {"\u2753"} Guide
          </button>
          <button className="eval-settings-btn" type="button" aria-label="Settings" onClick={() => { sessionStorage.setItem('scrollToBug', 'true'); onNavigate('settings'); }}>{"\u2699\uFE0F"}</button>
        </div>
      </header>

      <main className="eval-main-row" style={{ backgroundImage: `url('/images/Grass.png')`, backgroundPosition: 'bottom', backgroundRepeat: 'no-repeat', backgroundSize: '100% 20%' }}>
        <img src={cloud1Img} alt="Cloud" style={{ position: 'absolute', top: 50, left: '10%', opacity: 0.8, width: 150 }} />

          <section className="eval-left-col">
            <div className="eval-instruction-card">
              <span className="eval-instruction-tag">Instruction</span>
              <h2>{currentRound?.instruction ?? 'Can you guess the blank "?"'}</h2>
            </div>

            <div className="eval-camera-wrapper">
              <div className={`eval-camera-card eval-camera-card--${autoState}`} style={{ position: 'relative' }}>
                <div className="eval-live-badge"><span className="eval-live-dot" /> LIVE FEED</div>
                <video ref={videoRef} autoPlay playsInline muted className="eval-webcam-stream" />

                <div className="ps-crosshair">
                  <div className="ch-line ch-h"></div>
                  <div className="ch-line ch-v"></div>
                  <div className="ch-circle"></div>
                </div>

                {/* Real-time automatic grading HUD - Child-friendly, identical to Lesson Proper */}
                {!roundPassed && (
                  <div className={`eval-grading-hud hud-${autoState}`}>
                    {autoState === 'idle' && (
                      <div className="hud-badge hud-idle-badge">
                        <span className="hud-icon pulse-hand">✋</span>
                        <div className="hud-text-group">
                          <span className="hud-main-text">Show your hand to begin!</span>
                          <span className="hud-sub-text">Hold it up high so the camera can see!</span>
                        </div>
                      </div>
                    )}

                    {autoState === 'ready' && (
                      <div className="hud-badge hud-ready-badge">
                        <span className="hud-icon pulse-target">🎯</span>
                        <div className="hud-text-group">
                          <span className="hud-main-text">Get Ready!</span>
                          <span className="hud-sub-text">Starting in 1... 🎬</span>
                        </div>
                      </div>
                    )}

                    {autoState === 'signing' && (
                      <div className="hud-badge hud-signing-badge">
                        <div className="hud-countdown-ring">
                          <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path className="circle circle-signing"
                              strokeDasharray={`${holdProgress}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="countdown-number">
                            {Math.max(1, Math.ceil((100 - holdProgress) / 35))}
                          </span>
                        </div>
                        <div className="hud-text-group">
                          <span className="hud-main-text">🎬 Sign the number {currentAnswer}!</span>
                          <span className="hud-sub-text">Move your hand clearly in frame... ✨</span>
                        </div>
                      </div>
                    )}

                    {autoState === 'grading' && (
                      <div className="hud-badge hud-grading-badge">
                        <span className="hud-icon rotating-star">✨</span>
                        <div className="hud-text-group">
                          <span className="hud-main-text">Checking your sign!</span>
                          <span className="hud-sub-text">Looking at your fingers and palm... 🔍</span>
                        </div>
                      </div>
                    )}

                    {autoState === 'cooldown' && (
                      <div className="hud-badge hud-cooldown-badge">
                        <span className="hud-icon">⏱️</span>
                        <div className="hud-text-group">
                          <span className="hud-main-text">Try again in {cooldownRemaining}s!</span>
                          <span className="hud-sub-text">Shake your hands and get ready!</span>
                        </div>
                      </div>
                    )}

                    {baselineError && (
                      <div className="hud-error-banner">
                        <span>⚠️ {baselineError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Large Friendly Mascot sitting at bottom-left */}
              {!answerShown && (
                <div className="mg-mascot-wrap">
                  <img 
                    src={wonderMascot} 
                    alt="Mascot" 
                    className="mg-mascot-img"
                  />
                </div>
              )}

              {/* Celebration Mascot on passing */}
              {answerShown && (
                <div className="correct-mascot-container">
                  <img src={amazingMascot} alt="Amazing!" className="correct-mascot-img" />
                </div>
              )}

              {/* Floating Bottom Action Bar */}
              {maxedAttempts && (
                <div className="mg-bottom-actions">
                  <button className="ps-give-up-btn" type="button" onClick={giveUpReveal}>
                    💡 Show Answer
                  </button>
                </div>
              )}
            </div>
          </section>

        <section className="eval-right-col-container" style={{ position: 'relative', justifyContent: 'center' }}>
          {/* Watermark Background for the right pane */}
          <div className="ps-bg-watermark">
            <span className="bg-icon icon-1">{"\u2B50"}</span> {/* ⭐ */}
            <span className="bg-icon icon-2">{"\uD83C\uDFEB"}</span> {/* 🏫 */}
            <span className="bg-icon icon-3">{"\uD83D\uDE0A"}</span> {/* 😊 */}
            <span className="bg-icon icon-4">{"\uD83D\uDCF7"}</span> {/* 📷 */}
            <span className="bg-icon icon-5">{"\uD83E\uDD1F"}</span> {/* 🤟 */}
            <span className="bg-icon icon-6">{"\u2B50"}</span> {/* ⭐ */}
            <span className="bg-icon icon-7">{"\uD83C\uDFEB"}</span> {/* 🏫 */}
            <span className="bg-icon icon-8">{"\uD83D\uDE0A"}</span> {/* 😊 */}
            <span className="bg-icon icon-9">{"\uD83D\uDCF7"}</span> {/* 📷 */}
            <span className="bg-icon icon-10">{"\uD83E\uDD1F"}</span> {/* 🤟 */}
          </div>

          <div className="ps-puzzle-card" style={{ position: 'relative' }}>
            {showDemoVideo && currentRound?.referenceVideoUrl ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                <video
                  src={currentRound.referenceVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="max-h-full max-w-full rounded-2xl bg-black"
                  style={{ maxHeight: '200px', width: 'auto', borderRadius: '16px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowDemoVideo(false)}
                  style={{
                    marginTop: '10px',
                    padding: '6px 14px',
                    borderRadius: '12px',
                    background: '#4B5563',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  Back to Puzzle
                </button>
              </div>
            ) : (
              <>
                <div className="puzzle-equation">
                  <div className="puzzle-item">
                    {currentRound?.image1?.startsWith('http') || currentRound?.image1?.startsWith('/') ? (
                      <img
                        src={currentRound.image1}
                        alt="Word 1"
                        className="puzzle-emoji-img"
                        style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<span class="puzzle-emoji">☀️</span>';
                        }}
                      />
                    ) : (
                      <span className="puzzle-emoji">{currentRound?.image1 ?? '☀️'}</span>
                    )}
                    <div className="puzzle-underscore"></div>
                  </div>
                  <div className="puzzle-operator">+</div>
                  <div className="puzzle-item unknown">
                    {answerShown ? (
                      <span className="puzzle-emoji ps-revealed">{currentRound?.answerText ?? currentAnswer}</span>
                    ) : (
                      <span className="puzzle-qmark">?</span>
                    )}
                    <div className="puzzle-underscore"></div>
                  </div>
                  <div className="puzzle-operator">=</div>
                  <div className="puzzle-item">
                    {currentRound?.image3?.startsWith('http') || currentRound?.image3?.startsWith('/') ? (
                      <img
                        src={currentRound.image3}
                        alt="Result"
                        className="puzzle-emoji-img"
                        style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<span class="puzzle-emoji">🌤</span>';
                        }}
                      />
                    ) : (
                      <span
                        className="puzzle-emoji"
                        style={currentRound && currentRound.image3.length > 2 ? { fontSize: '3.5rem' } : undefined}
                      >
                        {currentRound?.image3 ?? '🌻'}
                      </span>
                    )}
                    <div className="puzzle-underscore"></div>
                  </div>
                </div>

                {currentRound?.referenceVideoUrl && (
                  <button
                    type="button"
                    onClick={() => setShowDemoVideo(true)}
                    style={{
                      marginTop: '12px',
                      background: 'linear-gradient(135deg, #2EABFF 0%, #0084FF 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '6px 16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,132,255,0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    ▶ Watch Demo
                  </button>
                )}
              </>
            )}
          </div>

          <div className="ps-score-card">
            <div className="score-row highest">
              <span className="score-label">Highest Score:</span>
              <span className="score-value">{HIGHEST_SCORE} XP</span>
            </div>
            <div className="score-row current">
              <span className="score-label">Score:</span>
              <span className="score-value">
                {score} XP 
                {streak > 0 && <span style={{fontSize: '1.2rem', color: '#E85D04', marginLeft: '10px', background: '#FFD6A5', padding: '4px 10px', borderRadius: '12px', verticalAlign: 'middle'}}>🔥 {(1 + (streak * 0.2)).toFixed(1)}x Bonus Active</span>}
              </span>
            </div>
          </div>

        </section>
      </main>
    </div>
  );

  const renderResults = () => {
    // Determine the rounds they actually played/solved
    // (If they quit early, roundIndex tells us how many they did. If they finished, it's rounds.length)
    const playedCount = Math.min(roundIndex, rounds.length);
    const playedRounds = rounds.slice(0, playedCount).map(r => ({
      answerText: r.answerText ?? String(r.answer)
    }));

    return (
      <MiniGameComplete 
        score={score} 
        playedRounds={playedRounds} 
        onBackToPractice={() => onNavigate('practice')} 
        onNavigate={onNavigate} 
      />
    );
  };

  switch (view) {
    case 'menu': return renderMenu();
    case 'camera-check': return <CameraSetup onDone={() => setView('game')} onCancel={() => setView('menu')} />;
    case 'game': return renderGame();
    case 'results': return renderResults();
    default: return renderMenu();
  }
}
