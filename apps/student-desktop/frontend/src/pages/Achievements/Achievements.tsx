import Navbar from '../../components/Sidebar/Sidebar';
import './Achievements.css';

const backButtonImg = '/images/Back Button.png';

interface AchievementsProps {
  onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings' | 'achievements') => void;
}

export default function Achievements({ onNavigate }: AchievementsProps) {
  return (
    <div className="achievements-page-container">
      {/* Sidebar */}
      <Navbar activeTab="profile" onNavigate={onNavigate as any} />

      {/* Main Content Area */}
      <main className="achievements-main">
        {/* Background Decorative Pattern */}
        <div className="achievements-bg-pattern">
          <span className="bg-icon icon-1">{"\u2B50"}</span>
          <span className="bg-icon icon-2">{"\uD83C\uDFC6"}</span>
          <span className="bg-icon icon-3">{"\uD83D\uDD25"}</span>
          <span className="bg-icon icon-4">{"\u2B50"}</span>
          <span className="bg-icon icon-5">{"\uD83C\uDF85"}</span>
        </div>

        <div className="achievements-content-scroll">
          <header className="achievements-page-header">
            <button 
              className="achievements-back-btn" 
              onClick={() => onNavigate?.('profile')}
              title="Back to Profile"
            >
              <img src={backButtonImg} alt="Back" />
            </button>
            <h1 className="page-title">All Achievements</h1>
            <div className="spacer"></div>
          </header>

          <div className="coming-soon-container">
            <div className="coming-soon-card">
              <div className="coming-soon-icon">{"\uD83D\uDEA7"}</div>
              <h2>More Achievements Coming Soon!</h2>
              <p>Keep learning and practicing. New badges and trophies will be added here as you progress through the modules.</p>
            </div>
          </div>
          
          <div className="achievements-full-grid">
              {/* Achievement 1 */}
              <div className="achievement-card card-trophy">
                <div className="achievement-icon-circle icon-trophy">{"\uD83C\uDFC6"}</div>
                <h3>Fast Learner</h3>
                <p>Complete 5 stages in under 10 minutes</p>
              </div>

              {/* Achievement 2 */}
              <div className="achievement-card card-flame active-border">
                <div className="achievement-icon-circle icon-flame">{"\uD83D\uDD25"}</div>
                <h3>On Fire</h3>
                <p>Maintain a 10-day learning streak</p>
              </div>

              {/* Achievement 3 */}
              <div className="achievement-card card-medal">
                <div className="achievement-icon-circle icon-medal">{"\uD83C\uDF85"}</div>
                <h3>Perfect Score</h3>
                <p>Get 100% on 3 consecutive evaluations</p>
              </div>

              {/* Achievement 4 (Locked) */}
              <div className="achievement-card locked">
                <div className="achievement-icon-circle icon-lock">{"\uD83D\uDD12"}</div>
                <h3>Mastermind</h3>
                <p>Complete Module 4</p>
              </div>

              {/* Achievement 5 (Locked) */}
              <div className="achievement-card locked">
                <div className="achievement-icon-circle icon-lock">{"\uD83D\uDD12"}</div>
                <h3>Super Signer</h3>
                <p>Learn 50 new signs</p>
              </div>
              
              {/* Achievement 6 (Locked) */}
              <div className="achievement-card locked">
                <div className="achievement-icon-circle icon-lock">{"\uD83D\uDD12"}</div>
                <h3>Consistency is Key</h3>
                <p>Practice for 7 days straight</p>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
}
