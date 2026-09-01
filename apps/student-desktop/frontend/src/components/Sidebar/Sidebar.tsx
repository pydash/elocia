<<<<<<< HEAD
import React from 'react';
import './Sidebar.css'; // Make sure your CSS file is renamed to this!

export default function Sidebar() { // Renamed from Navbar
  return (
    <nav className="elocia-sidebar">
      {/* Brand & Logo Only */}
      <div className="sidebar-brand">
        <img src="/src/assets/logo-icon.png" alt="ELOCIA Logo" className="logo-icon" />
      </div>

      {/* Navigation Links */}
      <ul className="sidebar-links">
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
=======
import './Sidebar.css';

interface NavbarProps {
  activeTab?: 'learn' | 'practice' | 'profile' | 'settings' | 'help';
  onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice') => void;
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
          className={`nav-item nav-practice-btn ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => onNavigate?.('practice')}
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
          className={`nav-item nav-settings-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate?.('settings')}
        >
          <span className="nav-icon">{"\u2699\uFE0F"}</span>
          <span className="nav-text">Settings</span>
        </li>
        <li
          className={`nav-item nav-help-btn ${activeTab === 'help' ? 'active' : ''}`}
          onClick={() => onNavigate?.('help')}
        >
          <span className="nav-icon">{"\u2753"}</span>
>>>>>>> 760f75e03194bc04076708af8826962e2e8fd3c6
          <span className="nav-text">Help</span>
        </li>
      </ul>

      {/* Logout Action */}
<<<<<<< HEAD
      <div className="sidebar-actions">
        <button className="logout-button">
          <span className="nav-icon">🚪</span>
=======
      <div className="navbar-actions">
        <button className="logout-button nav-logout-btn">
          <span className="nav-icon">{"\uD83D\uDEAA"}</span>
>>>>>>> 760f75e03194bc04076708af8826962e2e8fd3c6
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </nav>
  );
}