import Navbar from '../../components/Sidebar/Sidebar';
import './Help.css';

const TOUR_STEPS = [
  {
    icon: '🎓', label: 'Learn',
    title: 'Learn',
    desc: 'Go on an adventure! Explore the map and start brand new sign language lessons. This is where all the fun begins!',
  },
  {
    icon: '📝', label: 'Practice',
    title: 'Practice',
    desc: 'Play fun review games with the signs you already learned! Keep practicing and you will get better and better!',
  },
  {
    icon: '👤', label: 'Profile',
    title: 'Profile',
    desc: 'This is YOUR page! See your daily streak, count your stars, and show off all of your cool achievements!',
  },
  {
    icon: '⚙️', label: 'Settings',
    title: 'Settings',
    desc: 'Need to change something? Adjust your camera or pick a cool new avatar right here and you want to report a problem to our builders.',
  },
  {
    icon: '❓', label: 'Help',
    title: 'Help',
    desc: "That's this page! Come back here whenever you need help .",
  },
  {
    icon: '🚪', label: 'Logout',
    title: 'Logout',
    desc: "All done for today? Click here to safely log out. Great job — see you next time! 🌟",
  },
];

export default function Help({ onNavigate }: { onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings') => void }) {
  return (
    <div className="help-page-container">
      <Navbar activeTab="help" onNavigate={onNavigate} />
      <main className="help-main">

        {/* Background Decorative Pattern */}
        <div className="help-bg-pattern">
          <span className="bg-icon icon-1">{"\u2B50"}</span>
          <span className="bg-icon icon-2">{"\u270C\uFE0F"}</span>
          <span className="bg-icon icon-3">{"\uD83D\uDCF7"}</span>
          <span className="bg-icon icon-4">{"\u2B50"}</span>
          <span className="bg-icon icon-5">{"\uD83E\uDD1F"}</span>
          <span className="bg-icon icon-6">{"\u2699\uFE0F"}</span>
          <span className="bg-icon icon-7">{"\u2B50"}</span>
        </div>

        <div className="help-content-scroll">
          {/* Header Banner */}
          <section className="help-hero-card">
            <h1 className="help-title"> Need Help?</h1>
            <p className="help-subtitle">Find everything you need to know about using Elocia right here!</p>
          </section>

          {/* BUTTONS DIAGRAM PANEL */}
          <section className="help-section">
            <h2 className="section-heading">What do these buttons do?</h2>
            
            <div className="static-diagram-container">
              {/* Sidebar replica with callouts attached */}
              <div className="tour-sidebar-mock">
                <div className="tour-mock-logo">
                  <img src="/images/logo-icon.png" alt="Elocia Logo" className="mock-logo-img" />
                </div>

                {/* Nav items (steps 0–4) */}
                {TOUR_STEPS.slice(0, 5).map((step, i) => (
                  <div key={i} className={`tour-nav-item ${i === 2 ? 'tour-nav-item--active' : ''}`}>
                    <span className="tour-nav-icon">{step.icon}</span>
                    <span className="tour-nav-label">{step.label}</span>
                    <span className="tour-badge">{i + 1}</span>
                    
                    {/* The text callout pointing from the badge */}
                    <div className="diagram-callout">
                      <div className="diagram-connector"></div>
                      <div className="diagram-callout-content">
                        <h4>{step.title}</h4>
                        <p>{step.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Logout (step 5) */}
                <div className="tour-logout-item">
                  <span className="tour-nav-icon">🚪</span>
                  <span className="tour-nav-label">Logout</span>
                  <span className="tour-badge tour-badge--logout">6</span>
                  
                  {/* The text callout for logout */}
                  <div className="diagram-callout">
                    <div className="diagram-connector"></div>
                    <div className="diagram-callout-content logout-callout">
                      <h4>{TOUR_STEPS[5].title}</h4>
                      <p>{TOUR_STEPS[5].desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
