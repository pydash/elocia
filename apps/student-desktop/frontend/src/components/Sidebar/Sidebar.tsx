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
          <span className="nav-text">Help</span>
        </li>
      </ul>

      {/* Logout Action */}
      <div className="sidebar-actions">
        <button className="logout-button">
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </nav>
  );
}