import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { saveScore } from '../../utils/api';
import CameraSetup from '../Setup/CameraSetup';
import MiniGameComplete from '../MiniGameComplete/MiniGameComplete';
import './Puzzle Sign.css';
import '../../pages/Evaluation/EvaluationSession.css';

interface PuzzleSignProps {
  onNavigate: (view: 'navigation' | 'setup' | 'evaluation' | 'stageComplete' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign') => void;
}

const puzzleSignLogo = '/images/Puzzle Sign.png';
const wonderMascot = '/images/Wonder.png';
const wellDoneMascot = '/images/Well done.png';
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
const NOT_CONNECTED_MSG = "Not connected to the scoring server. Is the desktop app running?";

export default function PuzzleSign({ onNavigate }: PuzzleSignProps) {
  const [view, setView] = useState<'menu' | 'camera-check' | 'game' | 'results'>('menu');
  const [activeActivity, setActiveActivity] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ---- Game state ----
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0); // Added streak tracking
  const [attempts, setAttempts] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState<{ passed: boolean; overall: number; scores: ScoreSet } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [baselineError, setBaselineError] = useState<string | null>(null);

  const isEvaluatingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const recordingTimerRef = useRef<number | null>(null);

  const rounds = activeActivity != null ? (PUZZLE_ACTIVITIES[activeActivity] ?? []) : [];
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
    setView('camera-check');
  };

  const triggerEvaluation = () => {
    if (!currentRound) return;
    setBaselineError(null);
    setLastResult(null);
    setIsRecording(true);

    // Tell the backend to discard any old frames
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'clear' }));
    }

    // Give the student 3 seconds to perform the sign while frames stream
    recordingTimerRef.current = window.setTimeout(() => {
      setIsRecording(false);
      setIsEvaluating(true);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'evaluate', stageId: currentRound.answer }));
      } else {
        setIsEvaluating(false);
        setBaselineError(NOT_CONNECTED_MSG);
      }
    }, 3000);
  };

  const handleNextRound = () => {
    if (roundIndex < rounds.length - 1) {
      setRoundIndex(prev => prev + 1);
      setAttempts(0);
      setLastResult(null);
      setRevealed(false);
      setBaselineError(null);
    } else {
      setView('results');
    }
  };

  const giveUpReveal = () => {
    // After 3 failed attempts the round is revealed for free (0 XP)
    setRevealed(true);
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

  // Keep ref in sync so the frame-stream interval sees the latest value
  useEffect(() => {
    isEvaluatingRef.current = isEvaluating;
  }, [isEvaluating]);

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

    const ws = new WebSocket('ws://127.0.0.1:8000/ws/evaluate');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
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

            if (passed) {
              const multiplier = 1 + (streak * 0.2);
              const pointsEarned = Math.round(overall * multiplier);
              setScore(prev => prev + pointsEarned);
              setStreak(prev => prev + 1);
            } else {
              setStreak(0); // Reset streak on incorrect sign
            }

            // Save score to database
            const student = JSON.parse(localStorage.getItem('elocia_current_student') || '{}');
            saveScore({
              student_id: student.id,
              activity_type: 'puzzle_sign',
              stage_id: roundIndex,
              attempt_number: attempts + 1,
              tier_level: 1,
              score_handshape: data.scores.handshape,
              score_palm_orientation: data.scores.palmOrientation,
              score_location: data.scores.location,
              score_movement: data.scores.movement,
              score_overall: overall,
              passed: overall >= 60,
              streak: streak,
              xp_earned: score,
            });
          } else if (data.error) {
          // e.g. "Baseline not found for stage 2" -> friendly message
          setIsEvaluating(false);
          setIsRecording(false);
          setBaselineError(MISSING_BASELINE_MSG);
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
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      setIsRecording(false);
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
                    <span className="activity-text">Activity {num}</span>
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

            <div className="eval-camera-wrapper" style={{ marginBottom: 0 }}>
              <div className="eval-camera-card" style={{ position: 'relative' }}>
                <div className="eval-live-badge"><span className="eval-live-dot" /> LIVE FEED</div>
                <video ref={videoRef} autoPlay playsInline muted className="eval-webcam-stream" />

                <div className="ps-crosshair">
                  <div className="ch-line ch-h"></div>
                  <div className="ch-line ch-v"></div>
                  <div className="ch-circle"></div>
                </div>

                {isRecording && (
                  <div className="ps-recording-badge">
                    <span className="ps-recording-dot" />
                    Sign the number {currentAnswer}!
                  </div>
                )}

                {baselineError && (
                  <div className="ps-baseline-error">⚠ {baselineError}</div>
                )}
              </div>
            </div>

            <div className="ps-bottom-controls">
              <div className="ps-mascot-area">
                <img 
                  src={answerShown ? wellDoneMascot : wonderMascot} 
                  alt="Mascot" 
                  className="ps-mascot-img"
                />
              </div>
              
              <div className="ps-button-area">
                {maxedAttempts && (
                  <button className="ps-give-up-btn" type="button" onClick={giveUpReveal}>
                    Show me the answer
                  </button>
                )}
                
                {answerShown ? (
                  <button className="eval-next-btn ps-action-btn" type="button" onClick={handleNextRound}>
                    Next
                  </button>
                ) : (
                  <button
                    className="eval-next-btn ps-action-btn"
                    style={{ backgroundColor: '#2EABFF' }}
                    type="button"
                    onClick={triggerEvaluation}
                    disabled={isEvaluating || isRecording}
                  >
                    {isRecording ? 'Recording...' : isEvaluating ? 'Grading...' : 'Check My Sign'}
                  </button>
                )}
              </div>
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

          <div className="ps-puzzle-card">
            <div className="puzzle-equation">
              <div className="puzzle-item">
                <span className="puzzle-emoji">{currentRound?.image1 ?? '☀️'}</span>
                <div className="puzzle-underscore"></div>
              </div>
              <div className="puzzle-operator">+</div>
              <div className="puzzle-item unknown">
                {answerShown ? (
                  <span className="puzzle-emoji ps-revealed">{currentAnswer}</span>
                ) : (
                  <span className="puzzle-qmark">?</span>
                )}
                <div className="puzzle-underscore"></div>
              </div>
              <div className="puzzle-operator">=</div>
              <div className="puzzle-item">
                <span
                  className="puzzle-emoji"
                  style={currentRound && currentRound.image3.length > 2 ? { fontSize: '3.5rem' } : undefined}
                >
                  {currentRound?.image3 ?? '🌻'}
                </span>
                <div className="puzzle-underscore"></div>
              </div>
            </div>
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
