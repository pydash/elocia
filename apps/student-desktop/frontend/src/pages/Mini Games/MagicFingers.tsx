import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import CameraSetup from '../Setup/CameraSetup';
import MiniGameComplete from '../MiniGameComplete/MiniGameComplete';
import { fetchMiniGameConfigs, saveMiniGameScore, type MiniGameConfigItem } from '../../utils/api';
import './MagicFingers.css';
import '../../pages/Evaluation/EvaluationSession.css';

interface MagicFingersProps {
  onNavigate: (view: 'navigation' | 'setup' | 'evaluation' | 'stageComplete' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign' | 'see-it-sign-it' | 'magic-fingers') => void;
}

const magicFingersLogo = '/images/Magic fingers.png';
const wonderMascot = '/images/Wonder.png';
const wellDoneMascot = '/images/Well done.png';
const backButtonImg = '/images/Back Button.png';
const cloud1Img = '/images/Cloud 1.png';
const confettiImg = '/images/Confetti.png';

interface WordLetter {
  char: string;
  visible: boolean;
}

interface MagicActivity {
  id: number;
  name: string;
  image: string;
  wordText: string;
  word: WordLetter[];
  missingLetter: string;
  targetStage: number;
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
    missingLetter: 'S',
    targetStage: 1
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
    missingLetter: 'E',
    targetStage: 2
  },
  { 
    id: 3, 
    name: 'Everyday Objects: WATCH', 
    image: '/images/watch.png', 
    wordText: 'WATCH',
    word: [
      { char: 'W', visible: true },
      { char: 'A', visible: false },
      { char: 'T', visible: false },
      { char: 'C', visible: true },
      { char: 'H', visible: true }
    ],
    missingLetter: 'A',
    targetStage: 1
  }
];

const PASS_THRESHOLD = 60;
const NOT_CONNECTED_MSG = "Not connected to the scoring server. Is the desktop app running?";

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
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [roundPassed, setRoundPassed] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const isEvaluatingRef = useRef(false);
  const recordingTimerRef = useRef<number | null>(null);

  // Fetch dynamic game configurations from backend
  useEffect(() => {
    async function loadConfigs() {
      const remoteConfigs = await fetchMiniGameConfigs('magic_fingers');
      if (remoteConfigs && remoteConfigs.length > 0) {
        const mapped: MagicActivity[] = remoteConfigs.map((cfg: MiniGameConfigItem, idx: number) => {
          const rawWord = (cfg.target_sign || 'CAT').toUpperCase();
          // Hide second character or middle character
          const hideIdx = rawWord.length > 2 ? 1 : 0;
          const wordSlots: WordLetter[] = rawWord.split('').map((char, cIdx) => ({
            char,
            visible: cIdx !== hideIdx
          }));

          return {
            id: idx + 1,
            name: cfg.title,
            image: cfg.prompt_image || `/images/${idx + 1}.png`,
            wordText: rawWord,
            word: wordSlots,
            missingLetter: rawWord[hideIdx] || 'A',
            targetStage: idx + 1
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
          } else {
            setRoundPassed(false);
            setStreak(0); // V4.1 rule: Reset streak on incorrect answer
            setFeedbackError("Check your finger shape and try again!");
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
        const stageNum = currentActivity.targetStage || 1;
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
      // Game Complete - save score to backend
      const student = JSON.parse(localStorage.getItem('elocia_current_student') || '{}');
      if (student.id) {
        saveMiniGameScore({
          student_id: student.id,
          game_type: 'magic_fingers',
          score: score,
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
            <button className="eval-settings-btn" type="button" aria-label="Settings" onClick={() => { 
              sessionStorage.setItem('scrollToBug', 'true'); 
              onNavigate('settings'); 
            }}>{"\u2699\uFE0F"}</button>
          </div>
        </header>

        <main className="eval-main-row sisi-game-main">
          <img src={cloud1Img} alt="Cloud" className="mf-cloud-overlay" />
          
          {/* Left Column */}
          <section className="eval-left-col">
            
            {/* The Specific "Magic Fingers" Missing Letters UI */}
            <div className="eval-instruction-card sisi-instruction-card">
              <div className="mf-word-container">
                {wordData.map((letter, idx) => (
                  <div key={idx} className="mf-letter-slot">
                    <span className={`mf-letter ${!letter.visible && !roundPassed ? 'hidden' : ''}`}>
                      {letter.char}
                    </span>
                    <div className="mf-underline"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="eval-camera-wrapper sisi-camera-wrapper">
              <div className="eval-camera-card sisi-camera-card">
                <div className="eval-live-badge"><span className="eval-live-dot" /> LIVE FEED</div>
                <video ref={videoRef} autoPlay playsInline muted className="eval-webcam-stream" />

                <div className="mf-crosshair">
                  <div className="mf-ch-line sisi-ch-h"></div>
                  <div className="mf-ch-line sisi-ch-v"></div>
                  <div className="mf-ch-circle"></div>
                </div>

                {isRecording && (
                  <div className="ps-recording-badge">
                    <span className="ps-recording-dot" />
                    Sign the missing letter: {currentActivity.missingLetter}!
                  </div>
                )}

                {feedbackError && (
                  <div className="ps-baseline-error">⚠ {feedbackError}</div>
                )}
              </div>
            </div>

            <div className="ps-bottom-controls">
              <div className="mf-mascot-area">
                <img 
                  src={roundPassed ? wellDoneMascot : wonderMascot} 
                  alt="Mascot" 
                  className="mf-mascot-img"
                />
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
            <div className="mf-puzzle-card sisi-image-card-container">
              <img src={itemImage} alt="Word hint" className="mf-target-image" onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="sisi-fallback-emoji">🔤</span>';
              }}/>
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
