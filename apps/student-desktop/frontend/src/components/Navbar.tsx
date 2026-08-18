import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="elocia-navbar">
      {/* Brand & Logo Only */}
      <div className="navbar-brand">
        <img src="/src/assets/images/logo-icon.png" alt="ELOCIA Logo" className="logo-icon" />
      </div>

      {/* Navigation Links */}
      <ul className="navbar-links">
        <li className="nav-item active">
          <span className="nav-icon">📖</span>
          <span className="nav-text">Learn</span>
        </li>
        <li className="nav-item">
          <span className="nav-icon">🎯</span>
          <span className="nav-text">Practice</span>
        </li>
        <li className="nav-item">
          <span className="nav-icon">👤</span>
          <span className="nav-text">Profile</span>
        </li>
        <li className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">Settings</span>
        </li>
        <li className="nav-item">
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