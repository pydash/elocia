import { useState, useEffect, useRef } from 'react';
import './EvaluationSession.css';
import { getStageData } from '../../data/curriculum';

const moveAwayMascot = '/images/Move away.png';
const thinkingHandshape = '/images/Tier handshape thinking.png';
const thinkingOrientation = '/images/tier palm-orientation thinking.png';
const thinkingLocation = '/images/tier location thinking.png';
const thinkingMovement = '/images/tier movement thinking.png';
const dialogueKeepGoing = '/images/Keep Going.png';
const dialogueGiveBest = '/images/Give your Best.png';
const tier4Popup = '/images/Pop up Tier 4.png';
const okayButton = '/images/Okay Button.png';
const backButtonImg = '/images/Back Button.png';
const star1 = '/images/1 star.png';
const star2 = '/images/2 star.png';
const star3 = '/images/3 star.png';
const star4 = '/images/4 star.png';
const star5 = '/images/5 star.png';
const confettiImg = '/images/Confetti.png';
const amazingMascot = '/images/Amazing.png';

interface EvaluationSessionProps {
  stageId: number | null;
  onExit: () => void;
  onComplete: (stageId: number) => void;
  onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice') => void;
}

interface ScoreSet {
  handshape: number;
  palmOrientation: number;
  location: number;
  movement: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface LandmarksData {
  hand: Point3D[];
  pose: {
    nose: Point3D;
    leftShoulder: Point3D;
    rightShoulder: Point3D;
  };
  scores: ScoreSet;
  frames: number;
}

const passScores: ScoreSet = { handshape: 88, palmOrientation: 92, location: 90, movement: 85 };
const failScores: ScoreSet = { handshape: 35, palmOrientation: 65, location: 80, movement: 95 };

const getStarImage = (score: number): string => {
  if (score >= 90) return star5;
  if (score >= 75) return star4;
  if (score >= 60) return star3;
  if (score >= 40) return star2;
  return star1;
};

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

export default function EvaluationSession({ stageId, onExit, onComplete, onNavigate }: EvaluationSessionProps) {
  const currentStageId = stageId ?? 1;
  const stageData = getStageData(currentStageId);
  const items = stageData?.items || [{ globalId: 1, name: "1" }];
  const totalQuestions = items.length;

  const [questionIndex, setQuestionIndex] = useState(0);
  const currentItem = items[questionIndex];

  const [currentTier, setCurrentTier] = useState<1 | 2 | 3 | 4>(1);
  const [, setFailCount] = useState<number>(0);
  const [scores, setScores] = useState<ScoreSet>(failScores); // Start with failing so UI isn't passed
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const isEvaluatingRef = useRef<boolean>(false);

  // Diagnostic Mode State & Refs
  const [diagOn, setDiagOn] = useState<boolean>(false);
  const [diagData, setDiagData] = useState<{ scores: ScoreSet, frames: number } | null>(null);
  const diagRef = useRef(diagOn);
  const landmarksRef = useRef<LandmarksData | null>(null);
  const trailRef = useRef<{ x: number, y: number, a: number }[]>([]);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  // Sync state to ref so setInterval can access latest value without re-triggering useEffect
  useEffect(() => {
    isEvaluatingRef.current = isEvaluating;
  }, [isEvaluating]);

  useEffect(() => {
    diagRef.current = diagOn;
  }, [diagOn]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

  useEffect(() => {
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

    // Setup WebSocket
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/evaluate');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === 'result') {
          setScores(data.scores);
          setHasEvaluated(true);
          setIsEvaluating(false);

          const overall = data.overall;

          // Veto Rule: Even if the average is >= 60, if ANY parameter is < 60, the sign fails.
          const hasFailedParameter =
            data.scores.handshape < 60 ||
            data.scores.palmOrientation < 60 ||
            data.scores.location < 60 ||
            data.scores.movement < 60;

          if (overall < 60 || hasFailedParameter) {
            setFailCount(prev => {
              const newCount = prev + 1;
              if (newCount >= 4) setCurrentTier(4);
              else if (newCount >= 3) setCurrentTier(3);
              else if (newCount >= 2) setCurrentTier(2);
              else setCurrentTier(1);
              return newCount;
            });
          } else {
            // Pass!
            setFailCount(0);
            setCurrentTier(1);
          }
        } else if (data.action === 'landmarks') {
          landmarksRef.current = data;
          setDiagData({ scores: data.scores, frames: data.frames });
          // Update wrist trail
          if (data.hand && data.hand[0] && data.hand[0].x !== 0) {
            trailRef.current.push({ x: data.hand[0].x, y: data.hand[0].y, a: 1.0 });
            if (trailRef.current.length > 40) trailRef.current.shift();
          }
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

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
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(isRecording);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Diagnostic Render Loop
  useEffect(() => {
    let raf: number;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const canvas = overlayRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      if (!diagRef.current) return;

      const lm = landmarksRef.current;
      if (!lm || !lm.pose || !lm.hand) {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = 'bold 16px Quicksand';
        ctx.fillText('Waiting for skeleton...', 10, 24);
        return;
      }

      // X coordinate is NOT mirrored here because the canvas CSS uses transform: scaleX(-1)
      // to match the video. We draw raw coordinates, and CSS mirrors them both together.
      const X = (x: number) => x * w;
      const Y = (y: number) => y * h;

      // Draw Pose (Shoulders & Nose)
      const locOk = lm.scores.location >= 60;
      const bodyLineColor = locOk ? '#E02EE0' : '#E5484D'; // Purple / Magenta for good
      const bodyDotColor = locOk ? '#4A90E2' : '#8B0000'; // Blue for good
      const nose = lm.pose.nose;
      const ls = lm.pose.leftShoulder;
      const rs = lm.pose.rightShoulder;

      ctx.strokeStyle = bodyLineColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (ls && rs && ls.x !== 0 && rs.x !== 0) {
        ctx.beginPath();
        ctx.moveTo(X(ls.x), Y(ls.y));
        ctx.lineTo(X(rs.x), Y(rs.y));
        ctx.stroke();

        if (nose && nose.x !== 0) {
          ctx.beginPath();
          ctx.moveTo(X(nose.x), Y(nose.y));
          ctx.lineTo(X(ls.x), Y(ls.y));
          ctx.moveTo(X(nose.x), Y(nose.y));
          ctx.lineTo(X(rs.x), Y(rs.y));
          ctx.stroke();
          
          // Draw pose dots
          ctx.fillStyle = bodyDotColor;
          for (const p of [nose, ls, rs]) {
            ctx.beginPath();
            ctx.arc(X(p.x), Y(p.y), 6, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }

      // Draw Wrist Trail
      if (trailRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(X(trailRef.current[0].x), Y(trailRef.current[0].y));
        for (let i = 1; i < trailRef.current.length; i++) {
          const pt = trailRef.current[i];
          ctx.lineTo(X(pt.x), Y(pt.y));
          pt.a *= 0.95; // fade over time
        }
        ctx.strokeStyle = `rgba(245, 158, 11, 0.8)`; // Orange trail
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw Hand
      if (lm.hand[0] && lm.hand[0].x !== 0) {
        const handOk = Math.min(lm.scores.handshape, lm.scores.palmOrientation) >= 60;
        const handLineColor = handOk ? '#39FF14' : '#E5484D'; // Bright green for good
        const handDotColor = handOk ? '#FF0000' : '#8B0000'; // Bright red dots for good
        
        ctx.strokeStyle = handLineColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (const [a, b] of HAND_CONNECTIONS) {
          const p1 = lm.hand[a];
          const p2 = lm.hand[b];
          ctx.moveTo(X(p1.x), Y(p1.y));
          ctx.lineTo(X(p2.x), Y(p2.y));
        }
        ctx.stroke();

        ctx.fillStyle = handDotColor;
        for (const p of lm.hand) {
          ctx.beginPath();
          ctx.arc(X(p.x), Y(p.y), 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggleDiagnostic = () => {
    const next = !diagOn;
    setDiagOn(next);
    if (next) {
      trailRef.current = [];
      wsRef.current?.send(JSON.stringify({ action: 'start_diagnostic', stageId: currentItem.globalId }));
    } else {
      wsRef.current?.send(JSON.stringify({ action: 'stop_diagnostic' }));
      setDiagData(null);
    }
  };

  const triggerEvaluation = () => {
    setIsRecording(true);
    // Tell backend to clear previous frames
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'clear' }));
    }

    // Give the student 3 seconds to perform the sign while frames are sent
    setTimeout(() => {
      setIsRecording(false);
      setIsEvaluating(true);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'evaluate', stageId: currentItem.globalId }));
      }
    }, 3000);
  };

  const handleNext = () => {
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex(prev => prev + 1);
      setCurrentTier(1);
      setFailCount(0);
      setScores(failScores); // Reset scores so it's not instantly passed
      setHasEvaluated(false);
    } else {
      onComplete(currentStageId);
    }
  };

  const getGradeLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Great';
    if (score >= 60) return 'Good';
    return 'Keep Trying';
  };

  const parameters = [
    { name: 'Handshape',       cssClass: 'param-handshape',   mascot: thinkingHandshape,   score: scores.handshape },
    { name: 'Palm Orientation', cssClass: 'param-orientation',  mascot: thinkingOrientation, score: scores.palmOrientation },
    { name: 'Location',        cssClass: 'param-location',     mascot: thinkingLocation,    score: scores.location },
    { name: 'Movement',        cssClass: 'param-movement',     mascot: thinkingMovement,    score: scores.movement },
  ];

  const showFeedback = currentTier >= 2;

  const getDialogueImage = () => {
    if (currentTier === 1) return dialogueKeepGoing;
    return dialogueGiveBest;
  };

  const getLowestParameter = () => {
    const params = [
      { name: 'Handshape', score: scores.handshape },
      { name: 'Palm Orientation', score: scores.palmOrientation },
      { name: 'Location', score: scores.location },
      { name: 'Movement', score: scores.movement },
    ];
    let lowest = params[0];
    for (let i = 1; i < params.length; i++) {
      if (params[i].score < lowest.score) {
        lowest = params[i];
      }
    }
    return lowest;
  };

  const getTier2FeedbackMessage = () => {
    const lowest = getLowestParameter();
    if (lowest.name === 'Handshape') return "Check your fingers!\nMake sure the shape matches.";
    if (lowest.name === 'Palm Orientation') return "Turn your hand!\nCheck which way your palm faces.";
    if (lowest.name === 'Location') return "Move your hand!\nMake sure it's in the right spot.";
    if (lowest.name === 'Movement') return "Check your motion!\nFollow the exact path.";
    return "Give it your best!";
  };

  // Dev helpers for quickly previewing tiers — callable from the browser console:
  // forceTier1() ... forceTier4()
  const forceTier1 = () => { setCurrentTier(1); setScores(passScores); };
  const forceTier2 = () => { setCurrentTier(2); setScores(failScores); };
  const forceTier3 = () => { setCurrentTier(3); setScores(failScores); };
  const forceTier4 = () => { setCurrentTier(4); setScores(failScores); };
  Object.assign(window, { forceTier1, forceTier2, forceTier3, forceTier4 });

  const overallScore = (scores.handshape + scores.palmOrientation + scores.location + scores.movement) / 4;
  const allParametersPassed =
    scores.handshape >= 60 &&
    scores.palmOrientation >= 60 &&
    scores.location >= 60 &&
    scores.movement >= 60;
    
  // Passing condition requires BOTH a passing average AND no failing parameters
  const hasPassed = hasEvaluated && overallScore >= 60 && allParametersPassed && currentTier !== 4;

  return (
    <div className="evaluation-layout-1920">
      {hasPassed && (
        <img src={confettiImg} alt="Confetti" className="global-confetti-overlay" />
      )}

      <header className="eval-header-bar">
        <button className="eval-back-btn" onClick={(e) => { e.preventDefault(); onExit(); }} type="button" aria-label="Back">
          <img src={backButtonImg} alt="Back" />
        </button>

        <div className="eval-title-block">
          <div className="eval-main-title">
            Stage {currentStageId}: {stageData?.title}
          </div>
          <div className="eval-progress-track">
            {Array.from({ length: totalQuestions }, (_, index) => (
              <div key={index} className={`eval-progress-pill ${index < questionIndex + 1 ? 'done' : ''}`} />
            ))}
          </div>
        </div>
        <div className="eval-header-right">
          <span className="eval-counter-text">{questionIndex + 1} of {totalQuestions}</span>
          <button 
            className={`eval-diag-toggle ${diagOn ? 'active' : ''}`} 
            type="button" 
            title="Toggle Diagnostics"
            onClick={toggleDiagnostic}
          >
            {"\uD83D\uDD2C"}
          </button>
          <button className="eval-settings-btn" type="button" aria-label="Settings" onClick={() => { sessionStorage.setItem('scrollToBug', 'true'); onNavigate?.('settings'); }}>{"\u2699\uFE0F"}</button>
        </div>
      </header>

      {currentTier === 4 && (
        <div className="eval-tier4-overlay">
          <div className="tier4-modal">
            <div className="tier4-popup-wrap">
              <img src={tier4Popup} alt="Pass and Flag" className="tier4-popup-img" />
              <button onClick={handleNext} className="tier4-ok-btn" type="button" aria-label="OK">
                <img src={okayButton} alt="OK" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="eval-main-row">
        <section className="eval-left-col">
          <div className="eval-instruction-card">
            <span className="eval-instruction-tag">Instruction</span>
            <h2>Perform the number {currentItem.name} in sign language</h2>
          </div>

          <div className="eval-camera-wrapper">
            <div className="eval-camera-card" style={{ position: 'relative' }}>
              <div className="eval-live-badge"><span className="eval-live-dot" /> LIVE FEED</div>
              <video ref={videoRef} autoPlay playsInline muted className="eval-webcam-stream" />
              <canvas ref={overlayRef} className="eval-overlay-canvas" />
              <div className="eval-camera-tier-tag">Tier {currentTier}</div>

              {diagOn && diagData && (
                <div className="eval-diag-panel">
                  <div className="diag-stat">
                    <span className={`diag-stat-value ${diagData.scores.handshape >= 60 ? 'diag-good' : 'diag-bad'}`}>{diagData.scores.handshape}</span>
                    <span className="diag-stat-label">Hand</span>
                  </div>
                  <div className="diag-stat">
                    <span className={`diag-stat-value ${diagData.scores.palmOrientation >= 60 ? 'diag-good' : 'diag-bad'}`}>{diagData.scores.palmOrientation}</span>
                    <span className="diag-stat-label">Palm</span>
                  </div>
                  <div className="diag-stat">
                    <span className={`diag-stat-value ${diagData.scores.location >= 60 ? 'diag-good' : 'diag-bad'}`}>{diagData.scores.location}</span>
                    <span className="diag-stat-label">Loc</span>
                  </div>
                  <div className="diag-stat">
                    <span className="diag-stat-value" style={{ color: '#F59E0B' }}>{diagData.frames}</span>
                    <span className="diag-stat-label">Frames</span>
                  </div>
                </div>
              )}
            </div>

            {hasPassed ? (
              <div className="eval-success-controls">
                <div className="correct-mascot-container">
                  <img src={amazingMascot} alt="Amazing!" className="correct-mascot-img" />
                </div>
                <button className="eval-next-btn" type="button" onClick={handleNext}>
                  Next
                </button>
              </div>

            ) : (
              <div className="eval-success-controls">
                <button
                  className="eval-next-btn"
                  style={{ backgroundColor: '#2EABFF', marginTop: '15px' }}
                  type="button"
                  onClick={triggerEvaluation}
                  disabled={isEvaluating}
                >
                  {isEvaluating ? 'Grading...' : 'Check My Sign'}
                </button>
              </div>
            )}

          </div>
        </section>

        <section className="eval-right-col-container">
          <div className="eval-number-card">
            <div className="eval-number-display">{currentItem.name}</div>
          </div>

          <div className="eval-mascot-feedback-card">
            {currentTier === 3 ? (
              <div className="eval-tier3-panel">
                <span className="eval-tier3-badge">Teacher Demo</span>
                <div className="eval-teacher-video-box" style={{ overflow: 'hidden', position: 'relative', borderRadius: '12px' }}>
                  <span className="eval-watch-pill" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>Watch carefully!</span>
                  <video
                    src={`/videos/${currentItem.globalId}.mp4`}
                    controls
                    autoPlay
                    loop
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            ) : (
              <>
                {currentTier === 2 && hasEvaluated ? (
                  <div className="eval-css-speech-bubble">
                    {getTier2FeedbackMessage()}
                  </div>
                ) : (
                  <img src={getDialogueImage()} alt="Mascot dialogue" className="eval-dialogue-img" />
                )}
                <div className="eval-mascot-wrap">
                  <img src={moveAwayMascot} alt="Learning Mascot" className="eval-feedback-mascot-img" />
                </div>
              </>
            )}
          </div>

          <div className="eval-parameters-grid">
            {parameters.map((param) => {
              const needsWork = param.score < 60;
              const label = getGradeLabel(param.score);
              const starImg = getStarImage(param.score);
              return (
                <div key={param.name} className={`eval-param-card ${param.cssClass} ${needsWork ? 'needs-work' : ''} ${showFeedback ? 'show-feedback' : 'hide-feedback'}`}>
                  <div className="eval-param-title">{param.name}</div>
                  <img src={param.mascot} alt={`${param.name} mascot`} className="eval-param-mascot" />
                  <div className={`eval-param-label ${needsWork ? 'label-warn' : 'label-good'}`}>{label}</div>
                  <div className="eval-param-stars">
                    <img src={starImg} alt={`${label} stars`} className="param-star-icon" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

    </div>
  );
}
