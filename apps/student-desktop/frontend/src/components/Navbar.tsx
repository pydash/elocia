import './Navbar.css';

interface NavbarProps {
  activeTab?: 'learn' | 'practice' | 'profile' | 'settings' | 'help';
  onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile') => void;
}

export default function Navbar({ activeTab = 'learn', onNavigate }: NavbarProps) {
  return (
    <nav className="elocia-navbar">
      {/* Brand & Logo Only */}
      <div className="navbar-brand">
        <img src="/src/assets/images/logo-icon.png" alt="ELOCIA Logo" className="logo-icon" />
      </div>

      {/* Navigation Links */}
      <ul className="navbar-links">
        <li 
          className={`nav-item nav-learn-btn ${activeTab === 'learn' ? 'active' : ''}`}
          onClick={() => onNavigate?.('navigation')}
        >
          <span className="nav-icon">🎓</span>
          <span className="nav-text">Learn</span>
        </li>
        <li 
          className={`nav-item ${activeTab === 'practice' ? 'active' : ''}`}
        >
          <span className="nav-icon">📝</span>
          <span className="nav-text">Practice</span>
        </li>
        <li 
          className={`nav-item nav-profile-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => onNavigate?.('profile')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-text">Profile</span>
        </li>
        <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Settings</span>
        </li>
        <li className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}>
          <span className="nav-icon">❓</span>
          <span className="nav-text">Help</span>
        </li>
      </ul>

      {/* Logout Action */}
      <div className="navbar-actions">
        <button className="logout-button">
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </nav>
  );
}