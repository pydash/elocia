import { useRef, useEffect, useState } from 'react';
import './EvaluationSession.css';

//  MASCOT ASSETS 
import moveAwayMascot from '../assets/images/Move away.png';
import thinkingHandshape from '../assets/images/Tier handshape thinking.png';
import thinkingOrientation from '../assets/images/tier palm-orientation thinking.png';
import thinkingLocation from '../assets/images/tier location thinking.png';
import thinkingMovement from '../assets/images/tier movement thinking.png';

//DIALOGUE BUBBLE IMAGES (PER TIER)
import dialogueKeepGoing from '../assets/images/Keep Going.png';
import dialogueGiveBest from '../assets/images/Give your Best.png';

interface EvaluationSessionProps {
  stageId: number | null;
  onExit: () => void;
}

interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

interface LandmarkData {
  pose?: LandmarkPoint[];
  left_hand?: LandmarkPoint[];
  right_hand?: LandmarkPoint[];
  scores?: {
    handshape: number;
    palmOrientation: number;
    location: number;
    movement: number;
    overall: number;
    passed: boolean;
  };
}

type MascotType = 'handshape' | 'orientation' | 'location' | 'movement' | 'moveAway' | null;

export default function EvaluationSession({ stageId, onExit }: EvaluationSessionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // --- STATE ---
  const [scores, setScores] = useState({
    handshape: 0,
    palmOrientation: 0,
    location: 0,
    movement: 0,
    overall: 0,
    passed: false,
  });

  const [attemptCount, setAttemptCount] = useState(1);
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3 | 4>(1);
  const [activeMascot, setActiveMascot] = useState<MascotType>(null);
  const [showTeacherReplay, setShowTeacherReplay] = useState(false);

  const targetNumber = 22;
  const currentQuestion = stageId ?? 2;
  const totalQuestions = 10;

  
  const getMascotImage = () => {
    switch (activeMascot) {
      case 'handshape': return thinkingHandshape;
      case 'orientation': return thinkingOrientation;
      case 'location': return thinkingLocation;
      case 'movement': return thinkingMovement;
      case 'moveAway': return moveAwayMascot;
      default: return moveAwayMascot; // Default neutral monkey
    }
  };


  const getDialogueImage = () => {
    if (scores.overall >= 60) return dialogueKeepGoing;
    if (currentTier === 2) return dialogueGiveBest;
    return dialogueKeepGoing;
  };

  const handleSubmitSign = () => {
    if (scores.overall >= 60) {
      setActiveMascot(null);
      setShowTeacherReplay(false);
      return;
    }

    const nextAttempt = attemptCount + 1;
    setAttemptCount(nextAttempt);

    if (nextAttempt === 3) {
      setCurrentTier(2);
      const params = [
        { name: 'handshape', val: scores.handshape },
        { name: 'orientation', val: scores.palmOrientation },
        { name: 'location', val: scores.location },
        { name: 'movement', val: scores.movement },
      ];
      params.sort((a, b) => a.val - b.val);
      setActiveMascot(params[0].name as MascotType);
    } else if (nextAttempt === 4) {
      setCurrentTier(3);
      setActiveMascot(null);
      setShowTeacherReplay(true);
    } else if (nextAttempt >= 5) {
      setCurrentTier(4);
      setActiveMascot(null);
      setShowTeacherReplay(false);
      setTimeout(() => onExit(), 4000);
    }
  };


  useEffect(() => {
    let mounted = true;
    const videoElement = videoRef.current;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (mounted && videoElement) {
          videoElement.srcObject = stream;
        }
      } catch (err) {
        console.error('Webcam error:', err);
      }
    }
    startCamera();

    const websocket = new WebSocket('ws://127.0.0.1:8000/ws/evaluate');
    wsRef.current = websocket;

    websocket.onmessage = (event) => {
      try {
        const data: LandmarkData = JSON.parse(event.data);
        if (data.scores) setScores(data.scores);

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (data.right_hand || data.left_hand || data.pose) {
              ctx.fillStyle = '#22C55E';
              ctx.beginPath();
              ctx.arc(30, 30, 8, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    const interval = setInterval(() => {
      if (videoRef.current && websocket.readyState === WebSocket.OPEN) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          websocket.send(JSON.stringify({ image: canvas.toDataURL('image/jpeg', 0.5) }));
        }
      }
    }, 140);

    return () => {
      mounted = false;
      clearInterval(interval);
      websocket.close();
      if (videoElement?.srcObject) {
        (videoElement.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="evaluation-layout-1920">
      
      {/* 1. HEADER BAR */}
      <header className="eval-header-bar">
        <button className="eval-back-btn" onClick={onExit} type="button" aria-label="Back">
          ←
        </button>

        <div className="eval-title-block">
          <div className="eval-main-title">Stage {stageId ?? 3}: Numbers (21 - 30)</div>
          <div className="eval-progress-track">
            {Array.from({ length: totalQuestions }, (_, index) => (
              <div key={index} className={`eval-progress-pill ${index < currentQuestion ? 'done' : ''}`} />
            ))}
          </div>
        </div>

        <div className="eval-header-right">
          <span className="eval-counter-text">{currentQuestion} of {totalQuestions}</span>
          <button className="eval-settings-btn" type="button" aria-label="Settings">⚙</button>
        </div>
      </header>

      {/* 2. MAIN CONTENT ROW */}
      <main className="eval-main-row">
        
        {/* LEFT COLUMN */}
        <section className="eval-left-col">
          <div className="eval-instruction-card">
            <span className="eval-instruction-tag">Instruction:</span>
            <h2>Make the sign for {targetNumber} in sign language</h2>
          </div>

          <div className="eval-camera-card">
            <div className="eval-live-badge">
              <span className="eval-live-dot" /> LIVE FEED
            </div>

            <video ref={videoRef} autoPlay playsInline muted className="eval-webcam-stream" />
            <canvas ref={canvasRef} width={640} height={480} className="eval-overlay-canvas" />

            {/* TIER 2 MASCOT OVERLAY */}
            {activeMascot && (
              <img src={getMascotImage()} alt={`${activeMascot} feedback`} className={`eval-tier2-mascot mascot-${activeMascot}`} />
            )}

            {/* TIER 3 TEACHER REPLAY OVERLAY */}
            {showTeacherReplay && (
              <div className="eval-tier3-overlay">
                <h3>Tier 3: Watch the Teacher Carefully</h3>
                <div className="eval-teacher-video-box">[Teacher Reference Video]</div>
                <button onClick={() => setShowTeacherReplay(false)} className="eval-tier3-ready-btn">
                  I'm Ready to Try Again
                </button>
              </div>
            )}
          </div>

          <button className="eval-submit-btn" onClick={handleSubmitSign}>
            {scores.overall >= 60 ? 'Perfect! Pass Stage 🎉' : `Submit Attempt (${attemptCount}/4) [Tier ${currentTier}]`}
          </button>
        </section>

        {/* RIGHT COLUMN — OUTER CONTAINER */}
        <section className="eval-right-col-container">
          
          {/* Section 1 — Number Display Card */}
          <div className="eval-number-card">
            <div className="eval-number-display">{targetNumber}</div>
          </div>

          {/* Section 2 — Feedback / Mascot Card with Speech Bubble */}
          <div className="eval-mascot-feedback-card">
            <img src={getDialogueImage()} alt="Mascot dialogue" className="eval-dialogue-img" />
            <div className="eval-mascot-wrap">
              <img src={getMascotImage()} alt="Learning Mascot" className="eval-feedback-mascot-img" />
            </div>
          </div>

          {/* Section 3 — Clean 4-Card Grid with Phonological Mascots */}
          <div className="eval-parameters-grid">
            <div className="eval-param-card param-handshape">
              <div className="eval-param-title">Handshape</div>
              <img src={thinkingHandshape} alt="Handshape mascot" className="eval-param-mascot" />
              <div className="eval-param-score">{currentTier >= 2 ? `${Math.round(scores.handshape)}%` : ''}</div>
            </div>
            <div className="eval-param-card param-orientation">
              <div className="eval-param-title">Palm Orientation</div>
              <img src={thinkingOrientation} alt="Palm orientation mascot" className="eval-param-mascot" />
              <div className="eval-param-score">{currentTier >= 2 ? `${Math.round(scores.palmOrientation)}%` : ''}</div>
            </div>
            <div className="eval-param-card param-location">
              <div className="eval-param-title">Location</div>
              <img src={thinkingLocation} alt="Location mascot" className="eval-param-mascot" />
              <div className="eval-param-score">{currentTier >= 2 ? `${Math.round(scores.location)}%` : ''}</div>
            </div>
            <div className="eval-param-card param-movement">
              <div className="eval-param-title">Movement</div>
              <img src={thinkingMovement} alt="Movement mascot" className="eval-param-mascot" />
              <div className="eval-param-score">{currentTier >= 2 ? `${Math.round(scores.movement)}%` : ''}</div>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}