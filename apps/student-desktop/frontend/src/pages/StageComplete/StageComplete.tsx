import Navbar from '../../components/Sidebar/Sidebar';
import './StageComplete.css';
import { getStageData } from '../../data/curriculum';

const milestoneMascot = '/images/Stage Complete Milestone cutout.png';
const confettiImg = '/images/Confetti.png';
const sunImg = '/images/Sun.png';
const cloud1Img = '/images/Cloud 1.png';
const cloud2Img = '/images/Cloud 2.png';
const cloud3Img = '/images/Cloud 3.png';
const cloud5Img = '/images/Cloud 5.png';
const cloud6Img = '/images/Cloud 6.png';

interface StageCompleteProps {
  stageId: number | null;
  onBackToLearn: () => void;
  onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice') => void;
}

const TrophyIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 4h10v2h3a1 1 0 011 1c0 2.5-1.9 4.5-4.3 4.9A5.5 5.5 0 0113 15.9V18h3a1 1 0 011 1v1H7v-1a1 1 0 011-1h3v-2.1a5.5 5.5 0 01-3.7-3.99C4.9 11.5 3 9.5 3 7a1 1 0 011-1h3V4zm0 3H5.1A3.5 3.5 0 007 9.8V7zm10 0v2.8A3.5 3.5 0 0018.9 7H17z"
      fill="#F59E0B"
    />
  </svg>
);

const StarBadge = ({ number }: { number: number }) => (
  <svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 2l4.12 8.35 9.22 1.34-6.67 6.5 1.57 9.18L17 23.02l-8.24 4.35 1.57-9.18-6.67-6.5 9.22-1.34L17 2z"
      fill="#FFC93C"
      stroke="#E8A200"
      strokeWidth="1.5"
    />
    <text
      x="17"
      y="21"
      textAnchor="middle"
      fontFamily="Quicksand, sans-serif"
      fontSize="12"
      fontWeight="700"
      fill="#B45309"
    >
      {number}
    </text>
  </svg>
);

const CheckIcon = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15" r="14" fill="#3DBE64" stroke="#2E9E50" strokeWidth="2" />
    <path d="M9 15.5l4 4 8-8.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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

export default function StageComplete({ stageId, onBackToLearn, onNavigate }: StageCompleteProps) {
  const currentStageId = stageId ?? 1;
  const stageData = getStageData(currentStageId);
  const signs = stageData?.items ?? [];
  const xpEarned = signs.length * 10;

  return (
    <div className="app-layout">
      <Navbar activeTab="learn" onNavigate={onNavigate} />

      <div className="main-content-area stage-complete-bg">
        {/* Decorative sky */}
        <div className="clouds-wrapper">
          <img src={sunImg} alt="" className="bg-decor sun" />
          <img src={cloud1Img} alt="" className="bg-decor cloud-1" />
          <img src={cloud2Img} alt="" className="bg-decor cloud-2" />
          <img src={cloud3Img} alt="" className="bg-decor cloud-3" />
          <img src={cloud5Img} alt="" className="bg-decor cloud-5" />
          <img src={cloud6Img} alt="" className="bg-decor cloud-6" />
        </div>

        <img src={confettiImg} alt="" className="stage-complete-confetti" />

        {/* Milestone mascot sitting on top of the card */}
        <img src={milestoneMascot} alt="Stage Complete!" className="stage-complete-mascot" />

        {/* Main card */}
        <section className="stage-complete-card">
          <h1 className="stage-complete-title">STAGE COMPLETE</h1>

          <div className="xp-pill">
            <span className="xp-trophy"><TrophyIcon /></span>
            <div className="xp-texts">
              <div className="xp-title">Total Sign Points</div>
              <div className="xp-subtitle">Earned in this stage</div>
            </div>
            <div className="xp-amount">+{xpEarned} XP</div>
          </div>

          <div className="signs-practiced-label">Signs Practiced</div>

          <div className="signs-list">
            {signs.map((sign, index) => (
              <div className="sign-row" key={sign.globalId}>
                <span className="sign-star"><StarBadge number={index + 1} /></span>
                <span className="sign-name">{sign.name}</span>
                <span className="sign-check"><CheckIcon /></span>
              </div>
            ))}
          </div>
        </section>

        <button className="back-to-learn-btn" type="button" onClick={onBackToLearn}>
          <BookIcon />
          Back to Learn
        </button>
      </div>
    </div>
  );
}
