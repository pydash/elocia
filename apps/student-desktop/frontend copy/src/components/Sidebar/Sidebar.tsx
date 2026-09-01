import './Sidebar.css';

interface NavbarProps {
  activeTab?: 'learn' | 'practice' | 'profile' | 'settings' | 'help';
  onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings') => void;
}

export default function Navbar({ activeTab = 'learn', onNavigate }: NavbarProps) {
  return (
    <nav className="elocia-navbar">
      {/* Brand & Logo Only */}
      <div className="navbar-brand">
        <img src="/images/logo-icon.png" alt="ELOCIA Logo" className="logo-icon" />
      </div>

      {/* Navigation Links */}
      <ul className="navbar-links">
        <li
          className={`nav-item nav-learn-btn ${activeTab === 'learn' ? 'active' : ''}`}
          onClick={() => onNavigate?.('navigation')}
        >
          <span className="nav-icon">{"\uD83C\uDF93"}</span>
          <span className="nav-text">Learn</span>
        </li>
        <li
          className={`nav-item ${activeTab === 'practice' ? 'active' : ''}`}
        >
          <span className="nav-icon">{"\uD83D\uDCDD"}</span>
          <span className="nav-text">Practice</span>
        </li>
        <li
          className={`nav-item nav-profile-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => onNavigate?.('profile')}
        >
          <span className="nav-icon">{"\uD83D\uDC64"}</span>
          <span className="nav-text">Profile</span>
        </li>
        <li
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate?.('settings')}
        >
          <span className="nav-icon">{"\u2699\uFE0F"}</span>
          <span className="nav-text">Settings</span>
        </li>
        <li
          className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}
          onClick={() => onNavigate?.('help')}
        >
          <span className="nav-icon">{"\u2753"}</span>
          <span className="nav-text">Help</span>
        </li>
      </ul>

      {/* Logout Action */}
      <div className="navbar-actions">
        <button className="logout-button">
          <span className="nav-icon">{"\uD83D\uDEAA"}</span>
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </nav>
  );
}
