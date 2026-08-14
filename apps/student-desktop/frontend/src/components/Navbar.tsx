import React from 'react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="elocia-navbar">
      {/* Brand & Logo */}
      <div className="navbar-brand">
        <img src="/src/assets/logo-icon.png" alt="ELOCIA Logo" className="logo-icon" />
        <span className="brand-name">ELOCIA</span>
      </div>

      {/* Navigation Links */}
      <ul className="navbar-links">
        {/* Active Item */}
        <li className="nav-item active">
          <span className="nav-icon">📖</span> {/* Placeholder icon - we will swap this! */}
          <span className="nav-text">Learn</span>
        </li>
        
        {/* Inactive Items */}
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
          Logout
        </button>
      </div>
    </nav>
  );
}