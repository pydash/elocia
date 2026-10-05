import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import CameraSetup from '../Setup/CameraSetup';
import MiniGameComplete from '../MiniGameComplete/MiniGameComplete';
import {
  fetchMiniGameConfigs,
  fetchMiniGameActivities,
  saveMiniGameScore,
  resolveMediaUrl,
  type MiniGameConfigItem
} from '../../utils/api';
import './SeeItSignIt.css';
import './Puzzle Sign.css';
import '../../pages/Evaluation/EvaluationSession.css';
import { startSeeItSignItTour, stopCurrentTour } from '../../utils/activityTours';

interface SeeItSignItProps {
  onNavigate: (view: 'navigation' | 'setup' | 'evaluation' | 'stageComplete' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign' | 'see-it-sign-it') => void;
}

const seeItSignItLogo = '/images/See it, Sign it!.png';
const wonderMascot = '/images/Wonder.png';
const amazingMascot = '/images/Amazing.png';
const backButtonImg = '/images/Back Button.png';
const cloud1Img = '/images/Cloud 1.png';
const confettiImg = '/images/Confetti.png';

interface ActivityItem {
  id: number;
  name: string;
  image: string;
  item: string;
  targetSign: number | string;
  referenceVideoUrl?: string | null;
}

// Fallback activities if backend is unreachable
const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { id: 1, name: 'Number 1', image: '/images/1.png', item: 'Number 1', targetSign: 1 },
  { id: 2, name: 'Number 2', image: '/images/2.png', item: 'Number 2', targetSign: 2 },
  { id: 3, name: 'Number 3', image: '/images/3.png', item: 'Number 3', targetSign: 3 },
  { id: 4, name: 'Number 4', image: '/images/4.png', item: 'Number 4', targetSign: 4 },
  { id: 5, name: 'Number 5', image: '/images/5.png', item: 'Number 5', targetSign: 5 },
];

const PASS_THRESHOLD = 60;

export default function SeeItSignIt({ onNavigate }: SeeItSignItProps) {
  const [view, setView] = useState<'menu' | 'camera-check' | 'game' | 'results'>('menu');
  const [activities, setActivities] = useState<ActivityItem[]>(DEFAULT_ACTIVITIES);
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

  // Fetch dynamic game configurations and items from the backend
  useEffect(() => {
    async function loadConfigs() {
      // 1. Try relational activities with items first
      const remoteActivities = await fetchMiniGameActivities('see_it_sign_it');
      if (remoteActivities && remoteActivities.length > 0) {
        const flatItems: ActivityItem[] = [];
        remoteActivities.forEach((act) => {
          if (act.see_it_sign_it_items && act.see_it_sign_it_items.length > 0) {
            act.see_it_sign_it_items.forEach((item, itemIdx) => {
              const signNum = parseInt(item.objective_answer, 10);
              const resolvedImage = resolveMediaUrl(item.objective_image_url) || `/images/${item.objective_answer}.png`;
              const resolvedVideo = resolveMediaUrl(item.reference_video_url);

              flatItems.push({
                id: flatItems.length + 1,
                name: `${act.title} - Round ${itemIdx + 1}`,
                image: resolvedImage,
                item: item.objective_answer,
                targetSign: !isNaN(signNum) ? signNum : item.objective_answer,
                referenceVideoUrl: resolvedVideo,
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
      const remoteConfigs = await fetchMiniGameConfigs('see_it_sign_it');
      if (remoteConfigs && remoteConfigs.length > 0) {
        const mapped: ActivityItem[] = remoteConfigs.map((cfg: MiniGameConfigItem, idx: number) => {
          const signNum = parseInt(cfg.target_sign || '1', 10);
          return {
            id: idx + 1,
            name: cfg.title,
            image: cfg.prompt_image || `/images/${cfg.target_sign || '1'}.png`,
            item: cfg.hint_text || cfg.title,
            targetSign: !isNaN(signNum) ? signNum : 1,
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
    setScore(0);
    setStreak(0);
    setRoundPassed(false);
    setFeedbackError(null);
    setView('camera-check');
  };

  const streakRef = useRef(streak);
  const scoreRef = useRef(score);
  const currentActivityRef = useRef(currentActivity);

  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { currentActivityRef.current = currentActivity; }, [currentActivity]);
  useEffect(() => { isEvaluatingRef.current = isEvaluating; }, [isEvaluating]);

  useEffect(() => {
    if (view === 'game') {
      startSeeItSignItTour();
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

          if (passed) {
            hasPassedRef.current = true;
            setAutoState('passed');
            autoStateRef.current = 'passed';
            setRoundPassed(true);
            setFeedbackError(null);
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
              const roundsDone = parseInt(localStorage.getItem('elocia_see_it_rounds') || '0', 10) + 1;
              localStorage.setItem('elocia_see_it_rounds', roundsDone.toString());
            } catch (err) {
              console.warn('Failed to save see-it-sign-it rounds:', err);
            }

            // Automatically advance to the next round after celebration (2.5s)
            if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
            autoNextTimerRef.current = window.setTimeout(() => {
              handleNextRound();
            }, 2500);
          } else {
            hasPassedRef.current = false;
            setRoundPassed(false);
            setAttempts(prev => prev + 1);
            setStreak(0); // V4.1 rule: Reset streak on incorrect answer
            setFeedbackError("Keep trying! Make sure your hand shape matches the sign.");
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

                const curAct = currentActivityRef.current;
                if (ws.readyState === WebSocket.OPEN && curAct) {
                  const stageNum = typeof curAct.targetSign === 'number' ? curAct.targetSign : 1;
                  ws.send(JSON.stringify({ 
                    action: 'evaluate', 
                    stageId: stageNum,
                    stageName: curAct.item || curAct.name,
                    activityType: 'see_it_sign_it'
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
    setShowDemoVideo(false);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    if (roundIndex < totalRounds - 1) {
      const nextIdx = roundIndex + 1;
      setRoundIndex(nextIdx);
      setActiveActivity(activities[nextIdx]?.id || nextIdx + 1);
      setRoundPassed(false);
      setFeedbackError(null);
    } else {
      // Game Complete - save score to backend (capped at 500 XP max for mini-games)
      const student = JSON.parse(localStorage.getItem('elocia_current_student') || '{}');
      if (student.id) {
        const finalXp = Math.min(500, score);
        saveMiniGameScore({
          student_id: student.id,
          game_type: 'see_it_sign_it',
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
    <div className="sisi-layout">
      <Sidebar activeTab="practice" onNavigate={onNavigate} />
      <main className="sisi-main-menu">
        <div className="sisi-bg-watermark"></div>
        <div className="sisi-menu-content">
          <img src={seeItSignItLogo} alt="See it, Sign it!" className="sisi-logo" onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }} />

          <div className="sisi-activity-box">
            <div className="sisi-search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search activities"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="sisi-activities">
              {filteredActivities.map((act) => (
                <button
                  key={act.id}
                  className="sisi-activity-btn"
                  onClick={() => handleStartActivity(act.id)}
                >
                  <div className="sisi-activity-number">{act.id}</div>
                  <span className="sisi-activity-text">{act.name}</span>
                  <span className="sisi-activity-arrow">→</span>
                </button>
              ))}
              {filteredActivities.length === 0 && (
                <div className="sisi-no-results">No activities found</div>
              )}
            </div>
          </div>

          <button className="sisi-back-btn" onClick={() => onNavigate('practice')}>
            &lt; Back to Practice
          </button>
        </div>
      </main>
    </div>
  );

  const renderGame = () => {
    const itemShown = currentActivity.item;
    const itemImage = currentActivity.image;

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
              onClick={() => startSeeItSignItTour()}
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
            <div className="eval-instruction-card">
              <span className="eval-instruction-tag">Target Sign:</span>
              <h2 className="sisi-item-name">{itemShown}</h2>
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
                          <span className="hud-main-text">🎬 Sign "{itemShown}" now!</span>
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
            <div className="sisi-puzzle-card sisi-image-card-container">
              {showDemoVideo && currentActivity.referenceVideoUrl ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                  <video
                    src={currentActivity.referenceVideoUrl}
                    controls
                    autoPlay
                    loop
                    className="max-h-full max-w-full rounded-2xl bg-black"
                    style={{ maxHeight: '220px', width: 'auto', borderRadius: '16px' }}
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
                  <img src={itemImage} alt={itemShown} className="sisi-target-image" onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<span class="sisi-fallback-emoji">🖐️</span>';
                  }}/>
                  {currentActivity.referenceVideoUrl && (
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
                      ▶ Watch Demo
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="sisi-score-card">
              <div className="sisi-score-row highest">
                <span className="score-label">Highest Score:</span>
                <span className="score-value">{highScore} XP</span>
              </div>
              <div className="sisi-score-row current">
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
      answerText: a.item
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
