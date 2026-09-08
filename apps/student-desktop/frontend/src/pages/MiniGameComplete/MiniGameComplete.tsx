import Navbar from '../../components/Sidebar/Sidebar';
import './MiniGameComplete.css';

const milestoneMascot = '/images/Stage Complete Milestone cutout.png';
const confettiImg = '/images/Confetti.png';
const sunImg = '/images/Sun.png';
const cloud1Img = '/images/Cloud 1.png';
const cloud2Img = '/images/Cloud 2.png';
const cloud3Img = '/images/Cloud 3.png';
const cloud5Img = '/images/Cloud 5.png';
const cloud6Img = '/images/Cloud 6.png';

interface MiniGameCompleteProps {
  score: number;
  playedRounds: { answerText: string }[];
  onBackToPractice: () => void;
  onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'stageComplete' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign') => void;
}

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 4h10v2h3a1 1 0 011 1c0 2.5-1.9 4.5-4.3 4.9A5.5 5.5 0 0113 15.9V18h3a1 1 0 011 1v1H7v-1a1 1 0 011-1h3v-2.1a5.5 5.5 0 01-3.7-3.99C4.9 11.5 3 9.5 3 7a1 1 0 011-1h3V4zm0 3H5.1A3.5 3.5 0 007 9.8V7zm10 0v2.8A3.5 3.5 0 0018.9 7H17z"
      fill="#FFFFFF"
    />
  </svg>
);

const StarBadge = ({ number }: { number: number }) => (
  <div className="mg-sign-star">
    <svg viewBox="0 0 24 24" fill="#FCD34D" width="36" height="36">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
    <span className="mg-sign-star-num">{number}</span>
  </div>
);

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" fill="#D1FAE5" stroke="#22C55E" strokeWidth="2" />
    <path d="M7 12L10.5 15.5L18 8" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 5a2 2 0 012-2h5v16H6a2 2 0 00-2 2V5zm16 0a2 2 0 00-2-2h-5v16h5a2 2 0 012 2V5z"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export default function MiniGameComplete({ score, playedRounds, onBackToPractice, onNavigate }: MiniGameCompleteProps) {
  return (
    <div className="app-layout">
      <Navbar activeTab="practice" onNavigate={onNavigate} />

      <div className="main-content-area mg-complete-bg">
        {/* Decorative sky */}
        <div className="clouds-wrapper">
          <img src={sunImg} alt="" className="bg-decor sun" />
          <img src={cloud1Img} alt="" className="bg-decor cloud-1" />
          <img src={cloud2Img} alt="" className="bg-decor cloud-2" />
          <img src={cloud3Img} alt="" className="bg-decor cloud-3" />
          <img src={cloud5Img} alt="" className="bg-decor cloud-5" />
          <img src={cloud6Img} alt="" className="bg-decor cloud-6" />
        </div>

        <img src={confettiImg} alt="" className="mg-complete-confetti" />

        {/* Mascot sitting behind the card */}
        <img src={milestoneMascot} alt="Stage Complete!" className="mg-complete-mascot" />

        {/* Main card */}
        <section className="mg-complete-card">
          <h1 className="mg-complete-title">MINI GAME COMPLETE</h1>

          <div className="mg-xp-pill">
            <span className="mg-xp-trophy"><TrophyIcon /></span>
            <div className="mg-xp-texts">
              <div className="mg-xp-title">Total Sign Points</div>
              <div className="mg-xp-subtitle">Earned in this stage</div>
            </div>
            <div className="mg-xp-amount">+{score} XP</div>
          </div>

          <div className="mg-signs-practiced-label">Signs Practiced</div>

          <div className="mg-signs-list">
            {playedRounds.length > 0 ? (
              playedRounds.map((round, index) => (
                <div className="mg-sign-row" key={index}>
                  <StarBadge number={index + 1} />
                  <span className="mg-sign-name">{round.answerText}</span>
                  <span className="mg-sign-check"><CheckIcon /></span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#95a5a6', marginTop: '1rem', fontWeight: 600 }}>
                No signs completed.
              </div>
            )}
          </div>
        </section>

        <button className="mg-back-btn" type="button" onClick={onBackToPractice}>
          <BookIcon />
          Back to Practice
        </button>
      </div>
    </div>
  );
}
