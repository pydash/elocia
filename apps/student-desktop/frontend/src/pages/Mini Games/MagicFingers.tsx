import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import CameraSetup from '../Setup/CameraSetup';
import MiniGameComplete from '../MiniGameComplete/MiniGameComplete';
import './MagicFingers.css'; // Reusing the exact same layout CSS
import '../../pages/Evaluation/EvaluationSession.css';

interface MagicFingersProps {
  onNavigate: (view: 'navigation' | 'setup' | 'evaluation' | 'stageComplete' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign' | 'see-it-sign-it' | 'magic-fingers') => void;
}

const magicFingersLogo = '/images/Magic fingers.png';
const wonderMascot = '/images/Wonder.png';
const backButtonImg = '/images/Back Button.png';
const cloud1Img = '/images/Cloud 1.png';

// Dummy activities matching checklist for Magic Fingers
const ACTIVITIES = [
  { 
    id: 1, 
    name: 'Objects', 
    image: '/images/watch.png', 
    word: [
      { char: 'W', visible: true },
      { char: 'A', visible: false },
      { char: 'T', visible: false },
      { char: 'C', visible: true },
      { char: 'H', visible: true }
    ]
  },
  { 
    id: 2, 
    name: 'Animals', 
    image: '/images/cat.png', 
    word: [
      { char: 'C', visible: false },
      { char: 'A', visible: true },
      { char: 'T', visible: false }
    ]
  },
];

export default function MagicFingers({ onNavigate }: MagicFingersProps) {
  const [view, setView] = useState<'menu' | 'camera-check' | 'game' | 'results'>('menu');
  const [activeActivity, setActiveActivity] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Game state
  const totalRounds = 10;
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(300);
  const [streak, setStreak] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filter activities for menu
  const availableIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const filteredActivities = availableIds.filter(id => {
    const actName = ACTIVITIES.find(a => a.id === id)?.name || `Topic ${id}`;
    return actName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           `activity ${id}`.includes(searchQuery.toLowerCase());
  });

  // Handle start activity
  const handleStartActivity = (id: number) => {
    setActiveActivity(id);
    setRoundIndex(1); // Starting at round 2 based on screenshot (2 of 10)
    setScore(0);
    setStreak(0);
    setView('camera-check');
  };

  // Mock Camera Setup & Feedback Loop
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (view === 'game') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(console.error);

      // Mock Gameplay progression
      const interval = setInterval(() => {
        // Randomly simulate a wrong answer (20% chance) to show streak reset
        const isCorrect = Math.random() > 0.2;
        
        if (isCorrect) {
          setStreak(prev => {
            const currentStreak = prev;
            const multiplier = 1 + (currentStreak * 0.2);
            const pointsEarned = Math.round(50 * multiplier);
            
            setScore(currentScore => {
              const newScore = currentScore + pointsEarned;
              setHighScore(currentHigh => Math.max(currentHigh, newScore));
              return newScore;
            });
            
            return currentStreak + 1;
          });
          
          setRoundIndex(prev => {
            if (prev < totalRounds - 1) {
              return prev + 1;
            } else {
              // Game Complete!
              setView('results');
              return prev;
            }
          });
        } else {
          // Wrong answer simulated! Break the streak.
          setStreak(0);
        }
      }, 4000);
      
      return () => {
        if (stream) stream.getTracks().forEach(t => t.stop());
        clearInterval(interval);
      };
    }
  }, [view]);

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
              {filteredActivities.map((num) => {
                const actName = ACTIVITIES.find(a => a.id === num)?.name || `Topic ${num}`;
                return (
                  <button
                    key={num}
                    className="mf-activity-btn"
                    onClick={() => handleStartActivity(num)}
                  >
                    <div className="mf-activity-number">{num}</div>
                    <span className="mf-activity-text">Activity {num} - {actName}</span>
                    <span className="mf-activity-arrow">→</span>
                  </button>
                );
              })}
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
    const actData = ACTIVITIES.find(a => a.id === activeActivity);
    const itemImage = actData?.image || "/images/watch.png";
    const wordData = actData?.word || [
      { char: 'W', visible: true },
      { char: 'A', visible: false },
      { char: 'T', visible: false },
      { char: 'C', visible: true },
      { char: 'H', visible: true }
    ];

    return (
      <div className="evaluation-layout-1920">
        <header className="eval-header-bar">
          <button className="eval-back-btn" onClick={() => setView('menu')} type="button" aria-label="Back">
            <img src={backButtonImg} alt="Back" />
          </button>
          
          <div className="eval-title-block">
            <div className="eval-main-title">
              Activity {activeActivity}
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
                    <span className={`mf-letter ${!letter.visible ? 'hidden' : ''}`}>
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
              </div>
            </div>

            <div className="ps-bottom-controls">
              <div className="mf-mascot-area">
                <img 
                  src={wonderMascot} 
                  alt="Mascot" 
                  className="mf-mascot-img"
                />
              </div>
            </div>
          </section>

          {/* Right Column */}
          <section className="eval-right-col-container sisi-right-col">
            <div className="mf-puzzle-card sisi-image-card-container">
              <img src={itemImage} alt="Word hint" className="mf-target-image" onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="sisi-fallback-emoji">⌚</span>';
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
    const actData = ACTIVITIES.find(a => a.id === activeActivity);
    const itemWord = actData?.word.map(w => w.char).join('') || "WATCH";
    
    // Mock the played rounds data
    const playedRounds = Array.from({ length: totalRounds }).map(() => ({
      answerText: itemWord
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

