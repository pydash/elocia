import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import CameraSetup from '../Setup/CameraSetup';
import MiniGameComplete from '../MiniGameComplete/MiniGameComplete';
import { fetchMiniGameConfigs, fetchMiniGameActivities, saveMiniGameScore, resolveMediaUrl, type MiniGameConfigItem } from '../../utils/api';
import './MagicFingers.css';
import './Puzzle Sign.css';
import '../../pages/Evaluation/EvaluationSession.css';
import { startMagicFingersTour, stopCurrentTour } from '../../utils/activityTours';

interface MagicFingersProps {
  onNavigate: (view: 'navigation' | 'setup' | 'evaluation' | 'stageComplete' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign' | 'see-it-sign-it' | 'magic-fingers') => void;
}

const magicFingersLogo = '/images/Magic fingers.png';
const wonderMascot = '/images/Wonder.png';
const amazingMascot = '/images/Amazing.png';
const backButtonImg = '/images/Back Button.png';
const cloud1Img = '/images/Cloud 1.png';
const confettiImg = '/images/Confetti.png';

interface WordLetter {
  char: string;
  visible: boolean;
}

interface MissingTarget {
  charIndex: number;
  char: string;
  stageId: number;
  videoUrl?: string | null;
}

interface MagicActivity {
  id: number;
  name: string;
  image: string;
  wordText: string;
  word: WordLetter[];
  missingTargets: MissingTarget[];
  referenceVideoUrl?: string | null;
  referenceVideoUrl2?: string | null;
}

// Fallback activities for fingerspelling
const DEFAULT_ACTIVITIES: MagicActivity[] = [
  { 
    id: 1, 
    name: 'FSL Vocabulary: FSL', 
    image: '/images/1.png', 
    wordText: 'FSL',
    word: [
      { char: 'F', visible: true },
      { char: 'S', visible: false },
      { char: 'L', visible: true }
    ],
    missingTargets: [
      { charIndex: 1, char: 'S', stageId: 19 }
    ]
  },
  { 
    id: 2, 
    name: 'DHH Community: DEAF', 
    image: '/images/2.png', 
    wordText: 'DEAF',
    word: [
      { char: 'D', visible: true },
      { char: 'E', visible: false },
      { char: 'A', visible: true },
      { char: 'F', visible: true }
    ],
    missingTargets: [
      { charIndex: 1, char: 'E', stageId: 5 }
    ]
  },
  { 
    id: 3, 
    name: 'Everyday Objects: WATCH (2 Missing Letters)', 
    image: '/images/watch.png', 
    wordText: 'WATCH',
    word: [
      { char: 'W', visible: true },
      { char: 'A', visible: false },
      { char: 'T', visible: false },
      { char: 'C', visible: true },
      { char: 'H', visible: true }
    ],
    missingTargets: [
      { charIndex: 1, char: 'A', stageId: 1 },
      { charIndex: 2, char: 'T', stageId: 20 }
    ]
  }
];

const PASS_THRESHOLD = 60;

export default function MagicFingers({ onNavigate }: MagicFingersProps) {
  const [view, setView] = useState<'menu' | 'camera-check' | 'game' | 'results'>('menu');
  const [activities, setActivities] = useState<MagicActivity[]>(DEFAULT_ACTIVITIES);
  const [activeActivity, setActiveActivity] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Game state
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(300);
  const [streak, setStreak] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [roundPassed, setRoundPassed] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Multi-missing letters sequential progression state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [solvedIndices, setSolvedIndices] = useState<number[]>([]);

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const isEvaluatingRef = useRef(false);
  const recordingTimerRef = useRef<number | null>(null);
  const autoNextTimerRef = useRef<number | null>(null);
  const currentStepIndexRef = useRef(0);
  const solvedIndicesRef = useRef<number[]>([]);
  const currentActivityRef = useRef<MagicActivity>(DEFAULT_ACTIVITIES[0]);

  // Fetch dynamic game configurations and items from backend
  useEffect(() => {
    async function loadConfigs() {
      // 1. Try relational activities with items first
      const remoteActivities = await fetchMiniGameActivities('magic_fingers');
      if (remoteActivities && remoteActivities.length > 0) {
        const flatItems: MagicActivity[] = [];
        remoteActivities.forEach((act) => {
          if (act.magic_fingers_items && act.magic_fingers_items.length > 0) {
            act.magic_fingers_items.forEach((item, itemIdx) => {
              const rawWord = item.word.toUpperCase();
              let hiddenPositions = (item.hidden_positions || []).filter(pos => pos >= 0 && pos < rawWord.length);
              if (hiddenPositions.length === 0) {
                hiddenPositions = [rawWord.length > 2 ? 1 : 0];
              }
              // Sort positions sequentially from left to right
              hiddenPositions.sort((a, b) => a - b);
              const hiddenSet = new Set(hiddenPositions);

              const wordSlots: WordLetter[] = rawWord.split('').map((char, cIdx) => ({
                char,
                visible: !hiddenSet.has(cIdx)
              }));

              const resolvedVideo1 = resolveMediaUrl(item.reference_video_url);
              const resolvedVideo2 = resolveMediaUrl(item.reference_video_url_2);

              const missingTargets: MissingTarget[] = hiddenPositions.map((pos, targetIdx) => {
                const char = rawWord[pos] || 'A';
                const code = char.charCodeAt(0);
                const letterStage = (code >= 65 && code <= 90) ? (code - 64) : 1;
                // Use dedicated video for targetIdx if present, else fallback to primary video
                const dedicatedVideo = targetIdx === 1 ? (resolvedVideo2 || resolvedVideo1) : resolvedVideo1;
                return {
                  charIndex: pos,
                  char,
                  stageId: letterStage,
                  videoUrl: dedicatedVideo
                };
              });

              const resolvedImage = resolveMediaUrl(item.objective_image_url) || `/images/${itemIdx + 1}.png`;

              flatItems.push({
                id: flatItems.length + 1,
                name: `${act.title} - Round ${itemIdx + 1}`,
                image: resolvedImage,
                wordText: rawWord,
                word: wordSlots,
                missingTargets,
                referenceVideoUrl: resolvedVideo1,
                referenceVideoUrl2: resolvedVideo2,
              });
            });
          }
        });

        if (flatItems.length > 0) {
          setActivities(flatItems);
          return;
        }
      }

      // 2. Fallback to basic configs
      const remoteConfigs = await fetchMiniGameConfigs('magic_fingers');
      if (remoteConfigs && remoteConfigs.length > 0) {
        const mapped: MagicActivity[] = remoteConfigs.map((cfg: MiniGameConfigItem, idx: number) => {
          const rawWord = (cfg.target_sign || 'CAT').toUpperCase();
          const hideIdx = rawWord.length > 2 ? 1 : 0;
          const wordSlots: WordLetter[] = rawWord.split('').map((char, cIdx) => ({
            char,
            visible: cIdx !== hideIdx
          }));

          const char = rawWord[hideIdx] || 'A';
          const code = char.charCodeAt(0);
          const letterStage = (code >= 65 && code <= 90) ? (code - 64) : 1;

          return {
            id: idx + 1,
            name: cfg.title,
            image: cfg.prompt_image || `/images/${idx + 1}.png`,
            wordText: rawWord,
            word: wordSlots,
            missingTargets: [{ charIndex: hideIdx, char, stageId: letterStage }],
            referenceVideoUrl: null,
          };
        });
        setActivities(mapped);
      }
    }
    loadConfigs();
  }, []);

  const totalRounds = activities.length > 0 ? activities.length : DEFAULT_ACTIVITIES.length;
  const currentActivity = activities.find(a => a.id === activeActivity) || activities[0] || DEFAULT_ACTIVITIES[0];

  // Filter activities for menu
  const filteredActivities = activities.filter(act => {
    return act.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           `activity ${act.id}`.includes(searchQuery.toLowerCase());
  });

  // Handle start activity
  const handleStartActivity = (id: number) => {
    setActiveActivity(id);
    const foundIdx = activities.findIndex(a => a.id === id);
    setRoundIndex(foundIdx >= 0 ? foundIdx : 0);
    setCurrentStepIndex(0);
    currentStepIndexRef.current = 0;
    setSolvedIndices([]);
    solvedIndicesRef.current = [];
    setScore(0);
    setStreak(0);
    setRoundPassed(false);
    setFeedbackError(null);
    setShowDemoVideo(false);
    setView('camera-check');
  };

  const streakRef = useRef(streak);
  const scoreRef = useRef(score);

  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { isEvaluatingRef.current = isEvaluating; }, [isEvaluating]);
  useEffect(() => { currentStepIndexRef.current = currentStepIndex; }, [currentStepIndex]);
  useEffect(() => { solvedIndicesRef.current = solvedIndices; }, [solvedIndices]);
  useEffect(() => { currentActivityRef.current = currentActivity; }, [currentActivity]);

  useEffect(() => {
    if (view === 'game') {
      startMagicFingersTour();
    }
    return () => {
      stopCurrentTour();
    };
  }, [view]);

  // Real Computer Vision WebSocket & Webcam streaming
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
          setFeedbackError(data.error || "Sign baseline reference not found for this round.");
          return;
        }

        if (data.action === 'result') {
          setIsEvaluating(false);
          const scores = data.scores;
          const overall = data.overall;
          const passed =
            overall >= PASS_THRESHOLD &&
            scores.handshape >= PASS_THRESHOLD &&
            scores.palmOrientation >= PASS_THRESHOLD &&
            scores.location >= PASS_THRESHOLD &&
            scores.movement >= PASS_THRESHOLD;

          const act = currentActivityRef.current;
          const targets = act.missingTargets || [];
          const step = currentStepIndexRef.current;
          const currentTarget = targets[step];

          if (passed) {
            setFeedbackError(null);
            const targetCharIdx = currentTarget ? currentTarget.charIndex : -1;
            const newSolved = targetCharIdx >= 0 && !solvedIndicesRef.current.includes(targetCharIdx)
              ? [...solvedIndicesRef.current, targetCharIdx]
              : solvedIndicesRef.current;
            
            setSolvedIndices(newSolved);
            solvedIndicesRef.current = newSolved;

            // Check if there are more missing letters to solve in this word
            if (step + 1 < targets.length) {
              // Intermediate letter passed!
              const nextStep = step + 1;
              setCurrentStepIndex(nextStep);
              currentStepIndexRef.current = nextStep;
              setAttempts(0);
              setShowDemoVideo(false);
              // Give partial score reward for completing a letter
              setScore(prev => prev + 50);

              // Quick 1s pause before allowing next letter
              setAutoState('cooldown');
              autoStateRef.current = 'cooldown';
              setHoldProgress(0);
              holdStartRef.current = null;
              setCooldownRemaining(1);
              if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
              cooldownTimerRef.current = window.setInterval(() => {
                if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
                setAutoState('idle');
                autoStateRef.current = 'idle';
              }, 1200);
            } else {
              // All missing letters completed for this word!
              hasPassedRef.current = true;
              setAutoState('passed');
              autoStateRef.current = 'passed';
              setRoundPassed(true);
              const currentStreak = streakRef.current;
              const currentScore = scoreRef.current;
              const multiplier = 1 + (currentStreak * 0.2);
              const pointsEarned = Math.round(overall * multiplier);
              const newScore = currentScore + pointsEarned;
              setScore(newScore);
              setHighScore(prev => Math.max(prev, newScore));
              setStreak(prev => prev + 1);

              try {
                if (newScore >= 500) {
                  localStorage.setItem('elocia_game_score_500', 'true');
                }
                localStorage.setItem('elocia_magic_fingers_finished', 'true');
              } catch (err) {
                console.warn('Failed to save magic fingers game stats:', err);
              }

              // Automatically advance to the next round after celebration (2.5s)
              if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
              autoNextTimerRef.current = window.setTimeout(() => {
                handleNextRound();
              }, 2500);
            }
          } else {
            hasPassedRef.current = false;
            setAttempts(prev => prev + 1);
            setStreak(0); // V4.1 rule: Reset streak on incorrect answer
            setFeedbackError(currentTarget ? `Check your sign for '${currentTarget.char}' and try again!` : "Check your finger shape and try again!");
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

                const act = currentActivityRef.current;
                const targets = act.missingTargets || [];
                const currentTarget = targets[currentStepIndexRef.current] || targets[0];
                const stageNum = currentTarget?.stageId || 1;

                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ 
                    action: 'evaluate', 
                    stageId: stageNum,
                    stageName: currentTarget?.char || 'A',
                    activityType: 'magic_fingers'
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

    // Frame stream interval (140ms)
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
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      setIsEvaluating(false);
    };
  }, [view]);

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
    setAttempts(0);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    if (roundIndex < totalRounds - 1) {
      const nextIdx = roundIndex + 1;
      setRoundIndex(nextIdx);
      setActiveActivity(activities[nextIdx]?.id || nextIdx + 1);
      setCurrentStepIndex(0);
      currentStepIndexRef.current = 0;
      setSolvedIndices([]);
      solvedIndicesRef.current = [];
      setRoundPassed(false);
      setFeedbackError(null);
      setShowDemoVideo(false);
    } else {
      // Game Complete - save score to backend (capped at 500 XP max for mini-games)
      const student = JSON.parse(localStorage.getItem('elocia_current_student') || '{}');
      if (student.id) {
        const finalXp = Math.min(500, score);
        saveMiniGameScore({
          student_id: student.id,
          game_type: 'magic_fingers',
          score: finalXp,
          streak: streak,
          rounds_completed: totalRounds
        });
      }
      setView('results');
    }
  };

  // Menu Render
  const renderMenu = () => (
    <div className="mf-layout">
      <Sidebar activeTab="practice" onNavigate={onNavigate} />
      <main className="mf-main-menu">
        <div className="mf-bg-watermark"></div>
        <div className="mf-menu-content">
          <img src={magicFingersLogo} alt="Magic Fingers Logo" className="mf-logo" onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }} />

          <div className="mf-activity-box">
            <div className="mf-search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="mf-activities">
              {filteredActivities.map((act) => (
                <button
                  key={act.id}
                  className="mf-activity-btn"
                  onClick={() => handleStartActivity(act.id)}
                >
                  <div className="mf-activity-number">{act.id}</div>
                  <span className="mf-activity-text">{act.name}</span>
                  <span className="mf-activity-arrow">→</span>
                </button>
              ))}
              {filteredActivities.length === 0 && (
                <div className="mf-no-results">No activities found</div>
              )}
            </div>
          </div>

          <button className="mf-back-btn" onClick={() => onNavigate('practice')}>
            &lt; Back to Practice
          </button>
        </div>
      </main>
    </div>
  );

  // Game Render
  const renderGame = () => {
    const itemImage = currentActivity.image;
    const wordData = currentActivity.word;
    const targets = currentActivity.missingTargets || [];
    const currentTarget = targets[currentStepIndex] || targets[0];
    const totalMissing = targets.length;

    return (
      <div className="evaluation-layout-1920">
        {roundPassed && (
          <img src={confettiImg} alt="Confetti" className="global-confetti-overlay" />
        )}

        <header className="eval-header-bar">
          <button className="eval-back-btn" onClick={() => setView('menu')} type="button" aria-label="Back">
            <img src={backButtonImg} alt="Back" />
          </button>
          
          <div className="eval-title-block">
            <div className="eval-main-title">
              Activity {activeActivity} - {currentActivity.name}
            </div>
            <div className="eval-progress-track">
              {Array.from({ length: totalRounds }).map((_, index) => (
                <div key={index} className={`eval-progress-pill ${index <= roundIndex ? 'done' : ''}`} />
              ))}
            </div>
          </div>

          <div className="eval-header-right">
            <span className="eval-counter-text">{roundIndex + 1} of {totalRounds}</span>
            <button 
              className="eval-tour-toggle" 
              type="button" 
              title="Start Activity Guide"
              onClick={() => startMagicFingersTour()}
            >
              {"\u2753"} Guide
            </button>
            <button className="eval-settings-btn" type="button" aria-label="Settings" onClick={() => { 
              sessionStorage.setItem('scrollToBug', 'true'); 
              onNavigate('settings'); 
            }}>{"\u2699\uFE0F"}</button>
          </div>
        </header>

        <main className="eval-main-row" style={{ backgroundImage: `url('/images/Grass.png')`, backgroundPosition: 'bottom', backgroundRepeat: 'no-repeat', backgroundSize: '100% 20%' }}>
          <img src={cloud1Img} alt="Cloud" style={{ position: 'absolute', top: 50, left: '10%', opacity: 0.8, width: 150 }} />
          
          {/* Left Column */}
          <section className="eval-left-col">
            
            {/* The Specific "Magic Fingers" Missing Letters UI */}
            <div className="eval-instruction-card">
              <div className="mf-word-container">
                {wordData.map((letter, idx) => {
                  const isMissing = !letter.visible;
                  const isSolved = solvedIndices.includes(idx) || roundPassed;
                  const isTarget = isMissing && !isSolved && currentTarget?.charIndex === idx;

                  return (
                    <div 
                      key={idx} 
                      className={`mf-letter-slot ${isTarget ? 'active' : ''} ${isSolved ? 'slot-solved' : ''}`}
                    >
                      {isTarget && <span className="mf-slot-arrow">▼</span>}
                      <span className={`mf-letter ${isMissing && !isSolved ? 'hidden' : ''} ${isSolved ? 'solved' : ''}`}>
                        {letter.char}
                      </span>
                      <div className="mf-underline"></div>
                    </div>
                  );
                })}
              </div>

              {/* Sub-progress pills if 2 missing letters */}
              {totalMissing > 1 && (
                <div className="mf-sub-progress">
                  {targets.map((tgt, sIdx) => {
                    const isDone = solvedIndices.includes(tgt.charIndex) || roundPassed;
                    const isCurrent = currentStepIndex === sIdx && !roundPassed;
                    return (
                      <span 
                        key={sIdx} 
                        className={`mf-sub-pill ${isDone ? 'done' : isCurrent ? 'current' : ''}`}
                      >
                        Letter {sIdx + 1}: {tgt.char} {isDone ? '✓' : ''}
                      </span>
                    );
                  })}
                </div>
              )}
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
                          <span className="hud-main-text">
                            🎬 Sign letter: {currentTarget?.char}!
                          </span>
                          <span className="hud-sub-text">
                            {totalMissing > 1
                              ? `Letter ${currentStepIndex + 1} of ${totalMissing}`
                              : 'Move your fingers clearly in frame... ✨'}
                          </span>
                        </div>
                      </div>
                    )}

                    {autoState === 'grading' && (
                      <div className="hud-badge hud-grading-badge">
                        <span className="hud-icon rotating-star">✨</span>
                        <div className="hud-text-group">
                          <span className="hud-main-text">Checking letter {currentTarget?.char}!</span>
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

                    {feedbackError && (
                      <div className="hud-error-banner">
                        <span>⚠️ {feedbackError}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Large Friendly Mascot sitting at bottom-left */}
              {!(roundPassed || showDemoVideo) && (
                <div className="mg-mascot-wrap">
                  <img 
                    src={wonderMascot} 
                    alt="Mascot" 
                    className="mg-mascot-img"
                  />
                </div>
              )}

              {/* Celebration Mascot on passing */}
              {(roundPassed || showDemoVideo) && (
                <div className="correct-mascot-container">
                  <img src={amazingMascot} alt="Amazing!" className="correct-mascot-img" />
                </div>
              )}

              {/* Floating Bottom Action Bar */}
              {attempts >= 3 && !roundPassed && (
                <div className="mg-bottom-actions">
                  <button className="ps-give-up-btn" type="button" onClick={() => setShowDemoVideo(true)}>
                    💡 Show Answer
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Right Column */}
          <section className="eval-right-col-container sisi-right-col">
            <div className="mf-puzzle-card sisi-image-card-container">
              {(() => {
                const activeVideo = currentTarget?.videoUrl || currentActivity.referenceVideoUrl;
                const activeLetter = currentTarget?.char || currentActivity.missingTargets?.[0]?.char || '';
                return showDemoVideo && activeVideo ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1E293B', marginBottom: '6px' }}>
                      {totalMissing > 1 ? `Reference Video: Step ${currentStepIndex + 1} (Letter ${activeLetter})` : `Reference Video: Letter ${activeLetter}`}
                    </div>
                    <video
                      key={activeVideo}
                      src={activeVideo}
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
                      Back to Picture
                    </button>
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={itemImage} alt="Word hint" className="mf-target-image" onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="sisi-fallback-emoji">🔤</span>';
                    }}/>
                    {activeVideo && (
                      <button
                        type="button"
                        onClick={() => setShowDemoVideo(true)}
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          background: 'linear-gradient(135deg, #2EABFF 0%, #0084FF 100%)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '8px 16px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,132,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.9rem',
                          zIndex: 10,
                        }}
                      >
                        ▶ {totalMissing > 1 ? `Watch Demo (${activeLetter})` : 'Watch Demo'}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
            
            <div className="mf-score-card">
              <div className="mf-score-row highest">
                <span className="score-label">Highest Score:</span>
                <span className="score-value">{highScore} XP</span>
              </div>
              <div className="mf-score-row current">
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
  };

  // Results Render
  const renderResults = () => {
    const playedRounds = activities.slice(0, totalRounds).map(a => ({
      answerText: a.wordText
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
