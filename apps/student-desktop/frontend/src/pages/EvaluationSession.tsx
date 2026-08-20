import { useState, useEffect, useRef } from 'react';
import './EvaluationSession.css';

// --- MOCK ASSETS ---
import moveAwayMascot from '../assets/images/Move away.png';
import thinkingHandshape from '../assets/images/Tier handshape thinking.png';
import thinkingOrientation from '../assets/images/tier palm-orientation thinking.png';
import thinkingLocation from '../assets/images/tier location thinking.png';
import thinkingMovement from '../assets/images/tier movement thinking.png';

// --- DIALOGUE BUBBLES (PER TIER) ---
import dialogueKeepGoing from '../assets/images/Keep Going.png';
import dialogueGiveBest from '../assets/images/Give your Best.png';

// --- TIER 4 PASS & FLAG POPUP ---
import tier4Popup from '../assets/images/Pop up Tier 4.png';
import okayButton from '../assets/images/Okay Button.png';

// --- 1 TO 5 STAR RATING IMAGES ---
import star1 from '../assets/images/1 star.png';
import star2 from '../assets/images/2 star.png';
import star3 from '../assets/images/3 star.png';
import star4 from '../assets/images/4 star.png';
import star5 from '../assets/images/5 star.png';

interface EvaluationSessionProps {
  stageId: number | null;
  onExit: () => void;
}

interface ScoreSet {
  handshape: number;
  palmOrientation: number;
  location: number;
  movement: number;
}

interface ParameterMock {
  name: string;
  cssClass: string;
  mascot: string;
  score: number;
}

interface Grade {
  stars: string;
  label: string;
}

// --- GRADING RULES ---
const getGrade = (score: number): Grade => {
  if (score >= 90) return { stars: star5, label: 'Excellent!' };
  if (score >= 75) return { stars: star4, label: 'Great!' };
  if (score >= 60) return { stars: star3, label: 'Good!' };
  if (score >= 40) return { stars: star2, label: 'Keep trying!' };
  return { stars: star1, label: 'Keep trying!' };
};

// --- MOCK SCORES PER TIER ---
const passScores: ScoreSet = { handshape: 88, palmOrientation: 92, location: 90, movement: 85 };
const failScores: ScoreSet = { handshape: 35, palmOrientation: 65, location: 80, movement: 95 };

export default function EvaluationSession({ stageId, onExit }: EvaluationSessionProps) {
  const targetNumber = 22;
  const currentQuestion = stageId ?? 2;
  const totalQuestions = 10;
  const isDev = import.meta.env.DEV;

  // --- TIER STATE (mock) ---
  const [currentTier, setCurrentTier] = useState<1 | 2 | 3 | 4>(1);
  const [scores, setScores] = useState<ScoreSet>(passScores);

  // --- LIVE WEBCAM PREVIEW ---
  const videoRef = useRef<HTMLVideoElement>(null);

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

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const parameters: ParameterMock[] = [
    { name: 'Handshape', cssClass: 'param-handshape', mascot: thinkingHandshape, score: scores.handshape },
    { name: 'Palm Orientation', cssClass: 'param-orientation', mascot: thinkingOrientation, score: scores.palmOrientation },
    { name: 'Location', cssClass: 'param-location', mascot: thinkingLocation, score: scores.location },
    { name: 'Movement', cssClass: 'param-movement', mascot: thinkingMovement, score: scores.movement },
  ];

  const showFeedback = currentTier >= 2;

  const getDialogueImage = () => {
    if (currentTier === 1) return dialogueKeepGoing;
    return dialogueGiveBest;
  };

  // --- DEV MODE TIER SWITCHES ---
  const forceTier1 = () => { setCurrentTier(1); setScores(passScores); };
  const forceTier2 = () => { setCurrentTier(2); setScores(failScores); };
  const forceTier3 = () => { setCurrentTier(3); setScores(failScores); };
  const forceTier4 = () => { setCurrentTier(4); setScores(failScores); };

  return (
    <div className="evaluation-layout-1920">

      {/* HEADER BAR */}
      <header className="eval-header-bar">
        <button className="eval-back-btn" onClick={onExit} type="button" aria-label="Back">←</button>
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

      {/* TIER 4: PASS & FLAG MODAL */}
      {currentTier === 4 && (
        <div className="eval-tier4-overlay">
          <div className="tier4-modal">
            <div className="tier4-popup-wrap">
              <img src={tier4Popup} alt="Pass and Flag" className="tier4-popup-img" />
              <button onClick={onExit} className="tier4-ok-btn" type="button" aria-label="OK">
                <img src={okayButton} alt="OK" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="eval-main-row">

        {/* LEFT COLUMN — CAMERA PREVIEW */}
        <section className="eval-left-col">
          <div className="eval-instruction-card">
            <span className="eval-instruction-tag">Instruction:</span>
            <h2>Make the sign for {targetNumber} in sign language</h2>
          </div>

          <div className="eval-camera-card">
            <div className="eval-live-badge"><span className="eval-live-dot" /> LIVE FEED</div>
            <video ref={videoRef} autoPlay playsInline muted className="eval-webcam-stream" />
            <div className="eval-camera-tier-tag">Tier {currentTier}</div>
          </div>

          <button className="eval-submit-btn" type="button">
            Submit Attempt (Tier {currentTier})
          </button>
        </section>

        {/* RIGHT COLUMN — SCORE / FEEDBACK DASHBOARD */}
        <section className="eval-right-col-container">

          <div className="eval-number-card">
            <div className="eval-number-display">{targetNumber}</div>
          </div>

          {/* FEEDBACK CARD: Tier 3 = teacher demo on the right; else mascot + dialogue */}
          <div className="eval-mascot-feedback-card">
            {currentTier === 3 ? (
              <div className="eval-tier3-panel">
                <span className="eval-tier3-badge">Teacher Demo</span>
                <div className="eval-teacher-video-box">
                  <span className="eval-watch-pill">Watch carefully</span>
                  <button className="eval-play-btn" type="button" aria-label="Play teacher video">▶</button>
                </div>
              </div>
            ) : (
              <>
                <img src={getDialogueImage()} alt="Mascot dialogue" className="eval-dialogue-img" />
                <div className="eval-mascot-wrap">
                  <img src={moveAwayMascot} alt="Learning Mascot" className="eval-feedback-mascot-img" />
                </div>
              </>
            )}
          </div>

          {/* 4-CARD PARAMETER GRID */}
          <div className="eval-parameters-grid">
            {parameters.map((param) => {
              const grade = getGrade(param.score);
              const needsWork = param.score < 60;
              return (
                <div key={param.name} className={`eval-param-card ${param.cssClass} ${needsWork ? 'needs-work' : ''} ${showFeedback ? '' : 'hide-feedback'}`}>
                  <div className="eval-param-title">{param.name}</div>
                  <img src={param.mascot} alt={`${param.name} mascot`} className="eval-param-mascot" />
                  <div className={`eval-param-label ${needsWork ? 'label-warn' : 'label-good'}`}>{grade.label}</div>
                  <div className="eval-param-stars">
                    <img src={grade.stars} alt={`${grade.label} stars`} className="param-star-icon" />
                  </div>
                </div>
              );
            })}
          </div>

        </section>
      </main>

      {/* DEV TOOLS FLOATING PANEL (dev builds only) */}
      {isDev && (
        <div className="dev-tools-panel">
          <div className="dev-tools-title">⚙ Test Tiers</div>
          <button onClick={forceTier1}>Tier 1 (Keep Going)</button>
          <button onClick={forceTier2}>Tier 2 (Give your Best)</button>
          <button onClick={forceTier3}>Tier 3 (Teacher Demo)</button>
          <button onClick={forceTier4}>Tier 4 (Pass &amp; Flag)</button>
        </div>
      )}

    </div>
  );
}