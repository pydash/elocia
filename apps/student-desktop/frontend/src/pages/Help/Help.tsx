import Navbar from '../../components/Sidebar/Sidebar';
import './Help.css';
import { driver } from 'driver.js';
import type { DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STEPS: DriveStep[] = [
  {
    element: '.nav-learn-btn',
    popover: {
      title: 'Learn',
      description: 'Go on an adventure! Explore the map and start brand new sign language lessons. This is where all the fun begins!',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '.nav-practice-btn',
    popover: {
      title: 'Practice',
      description: 'Play fun review games with the signs you already learned! Keep practicing and you will get better and better!',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '.nav-profile-btn',
    popover: {
      title: 'Profile',
      description: 'This is YOUR page! See your daily streak, count your stars, and show off all of your cool achievements!',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '.nav-settings-btn',
    popover: {
      title: 'Settings',
      description: 'Need to change something? Adjust your camera or pick a cool new avatar right here.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '.nav-help-btn',
    popover: {
      title: 'Help',
      description: "That's this page! Come back here whenever you need a reminder of how things work.",
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '.nav-logout-btn',
    popover: {
      title: 'Logout',
      description: "All done for today? Click here to safely log out. Great job \u2014 see you next time!",
      side: 'right',
      align: 'end'
    }
  }
];

export default function Help({ onNavigate }: { onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice') => void }) {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      popoverClass: 'elocia-driver-theme',
      steps: TOUR_STEPS,
    });
    driverObj.drive();
  };

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
            <h1 className="help-title">Need Help?</h1>
            <p className="help-subtitle">Find everything you need to know about using Elocia right here!</p>
          </section>

          {/* INTERACTIVE TOUR PANEL */}
          <section className="help-section">
            <h2 className="section-heading">What do these buttons do?</h2>
            
            <div className="interactive-tour-container">
              <div className="interactive-tour-card">
                <div className="tour-card-icon">{"\uD83D\uDD0D"}</div>
                <h3>Take a guided tour!</h3>
                <p>Click the button below to turn off the lights and spotlight exactly how to use the menu.</p>
                <button className="start-tour-btn" onClick={startTour}>
                  Start Sidebar Tour
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
