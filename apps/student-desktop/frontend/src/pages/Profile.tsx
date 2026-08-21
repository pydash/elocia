import React from 'react';
import Navbar from '../components/Navbar';
import viewAllBtnImg from '../assets/images/View all Button.png';
import './Profile.css';

export default function Profile({ onNavigate }: { onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile') => void }) {
  return (
    <div className="profile-page-container">
      
      <Navbar activeTab="profile" onNavigate={onNavigate} />

      <main className="profile-main">
        
        <div className="profile-bg-pattern">
          
          <span className="bg-icon icon-1">⭐</span>
          <span className="bg-icon icon-2">✌️</span>
          <span className="bg-icon icon-3">📷</span>
          <span className="bg-icon icon-4">⭐</span>
          <span className="bg-icon icon-5">🤟</span>
          <span className="bg-icon icon-6">⚙️</span>
          <span className="bg-icon icon-7">⭐</span>
        </div>
        
        <div className="profile-content-scroll">

          <section className="profile-hero-card">
            <div className="hero-avatar-container">
              <div className="avatar-circle">
                <span className="avatar-emoji"></span>
              </div>
            </div>
            
            <div className="hero-info">
              <h1 className="student-name">Student 1</h1>
              <div className="hero-pills">
                <div className="pill streak-pill">
                  <span className="pill-icon">🔥</span>
                  <span className="pill-text">12 Day Streak</span>
                </div>
                <div className="pill level-pill">
                  <span className="pill-icon">🏆</span>
                  <span className="pill-text">Level 4</span>
                </div>
              </div>
            </div>
          </section>

          <section className="stats-row">
            
            <div className="stat-card stat-mastered">
              <div className="stat-icon-wrapper">🎓</div>
              <h2 className="stat-number">342</h2>
              <p className="stat-label">SIGNS MASTERED</p>
              <div className="stat-star star-orange-1">★</div>
              <div className="stat-star star-orange-2">★</div>
            </div>

            <div className="stat-card stat-average">
              <div className="stat-icon-wrapper">➗</div>
              <h2 className="stat-number">94%</h2>
              <p className="stat-label">AVERAGE SCORE</p>
              <div className="stat-star star-green-1">★</div>
              <div className="stat-star star-green-2">★</div>
            </div>

            <div className="stat-card stat-stages">
              <div className="stat-icon-wrapper">📖</div>
              <h2 className="stat-number">18</h2>
              <p className="stat-label">STAGES COMPLETE</p>
              <div className="stat-star star-pink-1">★</div>
              <div className="stat-star star-pink-2">★</div>
            </div>
          </section>

          <section className="achievements-section">
            <div className="achievements-header">
              <h2 className="achievements-title">Recent Achievements</h2>
              <button className="view-all-btn">
                <img src={viewAllBtnImg} alt="View all" />
              </button>
            </div>

            <div className="achievements-grid">
              
              <div className="achievement-card card-trophy">
                <div className="achievement-icon-circle icon-trophy">🏆</div>
                <h3>Fast Learner</h3>
                <p>Complete a stage under a minute</p>
              </div>

              <div className="achievement-card card-flame active-border">
                <div className="achievement-icon-circle icon-flame">🔥</div>
                <h3>On Fire!</h3>
                <p>Reach a 10 day streak</p>
              </div>

              <div className="achievement-card card-medal">
                <div className="achievement-icon-circle icon-medal">🏅</div>
                <h3>Perfect Score</h3>
                <p>Score 100% on a Unit Test</p>
              </div>

              <div className="achievement-card locked">
                <div className="achievement-icon-circle icon-lock">🔒</div>
                <h3>Mastermind</h3>
                <p>Unlock at Level 10</p>
              </div>

              <div className="achievement-card locked">
                <div className="achievement-icon-circle icon-lock">🔒</div>
                <h3>Mastermind</h3>
                <p>Unlock at Level 10</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
