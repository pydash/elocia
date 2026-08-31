import { useState, useRef, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import CameraSetup from '../Setup/CameraSetup';
import MiniGameComplete from '../MiniGameComplete/MiniGameComplete';
import './SeeItSignIt.css';
import '../../pages/Evaluation/EvaluationSession.css';

interface SeeItSignItProps {
  onNavigate: (view: 'navigation' | 'setup' | 'evaluation' | 'stageComplete' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign' | 'see-it-sign-it') => void;
}

const seeItSignItLogo = '/images/See it, Sign it!.png';
const wonderMascot = '/images/Wonder.png';
const backButtonImg = '/images/Back Button.png';

const cloud1Img = '/images/Cloud 1.png';

// Dummy activities matching checklist
const ACTIVITIES = [
  { id: 1, name: 'Fruits', image: '/images/orange.png', item: 'Orange' },
  { id: 2, name: 'Colors', image: '/images/color_red.png', item: 'Red' },
];

export default function SeeItSignIt({ onNavigate }: SeeItSignItProps) {
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
    setRoundIndex(1); // Starting at round 2 based on screenshot (2 of 10), but let's do 0-indexed: 1
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
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="sisi-activities">
              {filteredActivities.map((num) => {
                const actName = ACTIVITIES.find(a => a.id === num)?.name || `Topic ${num}`;
                return (
                  <button
                    key={num}
                    className="sisi-activity-btn"
                    onClick={() => handleStartActivity(num)}
                  >
                    <div className="sisi-activity-number">{num}</div>
                    <span className="sisi-activity-text">Activity {num} - {actName}</span>
                    <span className="sisi-activity-arrow">→</span>
                  </button>
                );
              })}
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
    const actData = ACTIVITIES.find(a => a.id === activeActivity);
    const itemShown = actData?.item || "Orange";
    const itemImage = actData?.image || "/images/orange.png";

    return (
      <div className="evaluation-layout-1920">
        <header className="eval-header-bar">
          <button className="eval-back-btn" onClick={() => setView('menu')} type="button" aria-label="Back">
            <img src={backButtonImg} alt="Back" />
          </button>
          
          <div className="eval-title-block">
            <div className="eval-main-title">
              Activity {activeActivity} - {actData?.name || 'Fruits'}
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
          <img src={cloud1Img} alt="Cloud" className="sisi-cloud-overlay" />
          
          {/* Left Column */}
          <section className="eval-left-col">
            <div className="eval-instruction-card sisi-instruction-card">
              <span className="eval-instruction-tag">Item shown:</span>
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
              </div>
            </div>

            <div className="ps-bottom-controls">
              <div className="sisi-mascot-area">
                <img 
                  src={wonderMascot} 
                  alt="Mascot" 
                  className="sisi-mascot-img"
                />
              </div>
            </div>
          </section>

          {/* Right Column */}
          <section className="eval-right-col-container sisi-right-col">
            <div className="sisi-puzzle-card sisi-image-card-container">
              <img src={itemImage} alt={itemShown} className="sisi-target-image" onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="sisi-fallback-emoji">🍊</span>';
              }}/>
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
    const actData = ACTIVITIES.find(a => a.id === activeActivity);
    const itemShown = actData?.item || "Orange";
    
    // Mock the played rounds data
    const playedRounds = Array.from({ length: totalRounds }).map(() => ({
      answerText: itemShown
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
