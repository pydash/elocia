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
const NOT_CONNECTED_MSG = "Not connected to the scoring server. Is the desktop app running?";

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
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [roundPassed, setRoundPassed] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const isEvaluatingRef = useRef(false);
  const recordingTimerRef = useRef<number | null>(null);

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

  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { scoreRef.current = score; }, [score]);
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
          } else {
            setRoundPassed(false);
            setStreak(0); // V4.1 rule: Reset streak on incorrect answer
            setFeedbackError("Keep trying! Make sure your hand shape matches the sign.");
          }
        } else if (data.error) {
          setIsEvaluating(false);
          setIsRecording(false);
          setFeedbackError("Sign baseline reference not found for this round.");
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
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      setIsRecording(false);
      setIsEvaluating(false);
    };
  }, [view]);

  const triggerEvaluation = () => {
    setFeedbackError(null);
    setRoundPassed(false);
    setIsRecording(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'clear' }));
    }

    // 3 seconds window to capture student sign
    recordingTimerRef.current = window.setTimeout(() => {
      setIsRecording(false);
      setIsEvaluating(true);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const stageNum = typeof currentActivity.targetSign === 'number' ? currentActivity.targetSign : 1;
        wsRef.current.send(JSON.stringify({ action: 'evaluate', stageId: stageNum }));
      } else {
        setIsEvaluating(false);
        setFeedbackError(NOT_CONNECTED_MSG);
      }
    }, 3000);
  };

  const handleNextRound = () => {
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

        <main className="eval-main-row sisi-game-main">
          <img src={cloud1Img} alt="Cloud" className="sisi-cloud-overlay" />
          
          {/* Left Column */}
          <section className="eval-left-col">
            <div className="eval-instruction-card sisi-instruction-card">
              <span className="eval-instruction-tag">Target Sign:</span>
              <h2 className="sisi-item-name">{itemShown}</h2>
            </div>

            <div className="eval-camera-wrapper sisi-camera-wrapper">
              <div className="eval-camera-card sisi-camera-card">
                <div className="eval-live-badge"><span className="eval-live-dot" /> LIVE FEED</div>
                <video ref={videoRef} autoPlay playsInline muted className="eval-webcam-stream" />

                <div className="sisi-crosshair">
                  <div className="sisi-ch-line sisi-ch-h"></div>
                  <div className="sisi-ch-line sisi-ch-v"></div>
                  <div className="sisi-ch-circle"></div>
                </div>

                {isRecording && (
                  <div className="ps-recording-badge">
                    <span className="ps-recording-dot" />
                    Signing in progress... Keep steady!
                  </div>
                )}

                {feedbackError && (
                  <div className="ps-baseline-error">⚠ {feedbackError}</div>
                )}
              </div>

              {roundPassed && (
                <div className="correct-mascot-container">
                  <img src={amazingMascot} alt="Amazing!" className="correct-mascot-img" />
                </div>
              )}
            </div>

            <div className="ps-bottom-controls">
              <div className="sisi-mascot-area">
                {!roundPassed && (
                  <img 
                    src={wonderMascot} 
                    alt="Mascot" 
                    className="sisi-mascot-img"
                  />
                )}
              </div>

              <div className="ps-button-area">
                {roundPassed ? (
                  <button className="eval-next-btn ps-action-btn" type="button" onClick={handleNextRound}>
                    Next Round
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
