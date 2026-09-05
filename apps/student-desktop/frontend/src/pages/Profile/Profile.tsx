import { useState, useEffect } from 'react';
import Navbar from '../../components/Sidebar/Sidebar';
const viewAllBtnImg = "/images/View all Button.png";
import './Profile.css';

interface StudentData {
  id?: string;
  name: string;
  color?: string;
  emoji?: string;
  level?: number;
  streak?: number;
  signs_mastered?: number;
  avg_score?: number;
  stages_complete?: number;
}

export default function Profile({ onNavigate }: { onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice') => void }) {
  const [avatar] = useState<string>(() => localStorage.getItem('elocia_avatar') || '');
  const [student, setStudent] = useState<StudentData>(() => {
    const saved = localStorage.getItem('elocia_current_student');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback if parsing fails
      }
    }
    return {
      name: 'Ethan',
      level: 1,
      streak: 0,
      signs_mastered: 0,
      avg_score: 0,
      stages_complete: 0,
      emoji: '👦',
      color: '#F59E0B'
    };
  });

  // Fetch real-time updated stats from the backend for the active student
  useEffect(() => {
    if (student.id) {
      fetch(`http://localhost:8000/users/${student.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.name) {
            setStudent(prev => ({
              ...prev,
              ...data
            }));
          }
        })
        .catch(err => console.warn('Could not refresh live student profile:', err));
    }
  }, [student.id]);

  const displayAvatar = avatar.startsWith('data:') 
    ? avatar 
    : (student.emoji || avatar || '👦');

  return (
    <div className="profile-page-container">
      {/* Sidebar */}
      <Navbar activeTab="profile" onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="profile-main">
        {/* Background Decorative Pattern */}
        <div className="profile-bg-pattern">
          <span className="bg-icon icon-1">{"\u2B50"}</span>
          <span className="bg-icon icon-2">{"\u270C\uFE0F"}</span>
          <span className="bg-icon icon-3">{"\uD83D\uDCF7"}</span>
          <span className="bg-icon icon-4">{"\u2B50"}</span>
          <span className="bg-icon icon-5">{"\uD83E\uDD1F"}</span>
          <span className="bg-icon icon-6">{"\u2699\uFE0F"}</span>
          <span className="bg-icon icon-7">{"\u2B50"}</span>
        </div>

        <div className="profile-content-scroll">

          {/* Hero Card */}
          <section className="profile-hero-card" style={{ borderColor: student.color || '#3B82F6' }}>
            <div className="hero-avatar-container" style={{ background: student.color || '#F59E0B' }}>
              <div className="avatar-circle" style={{ width: '100%', height: '100%', position: 'relative' }}>
                {avatar.startsWith('data:') ? (
                  <img src={avatar} alt="Your avatar" style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span className="avatar-emoji" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '3rem' }}>
                    {displayAvatar}
                  </span>
                )}
              </div>
            </div>

            <div className="hero-info">
              <h1 className="student-name">{student.name}</h1>
              <div className="hero-pills">
                <div className="pill streak-pill">
                  <span className="pill-icon">{"\uD83D\uDD25"}</span>
                  <span className="pill-text">{student.streak ?? 0} Day Streak</span>
                </div>
                <div className="pill level-pill">
                  <span className="pill-icon">{"\uD83C\uDFC6"}</span>
                  <span className="pill-text">Level {student.level ?? 1}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Row */}
          <section className="stats-row">
            {/* Stat: Signs Mastered */}
            <div className="stat-card stat-mastered">
              <div className="stat-icon-wrapper">{"\uD83C\uDF93"}</div>
              <h2 className="stat-number">{student.signs_mastered ?? 0}</h2>
              <p className="stat-label">Signs Mastered</p>
              <div className="stat-star star-orange-1">{"\u2B50"}</div>
              <div className="stat-star star-orange-2">{"\u2B50"}</div>
            </div>

            {/* Stat: Average Score */}
            <div className="stat-card stat-average">
              <div className="stat-icon-wrapper">{"\u2797"}</div>
              <h2 className="stat-number">
                {student.avg_score != null ? `${Math.round(student.avg_score)}%` : '0%'}
              </h2>
              <p className="stat-label">Average Score</p>
              <div className="stat-star star-green-1">{"\u2B50"}</div>
              <div className="stat-star star-green-2">{"\u2B50"}</div>
            </div>

            {/* Stat: Stages Complete */}
            <div className="stat-card stat-stages">
              <div className="stat-icon-wrapper">{"\uD83D\uDCD6"}</div>
              <h2 className="stat-number">{student.stages_complete ?? 0}</h2>
              <p className="stat-label">Stages Complete</p>
              <div className="stat-star star-pink-1">{"\u2B50"}</div>
              <div className="stat-star star-pink-2">{"\u2B50"}</div>
            </div>
          </section>

          {/* Achievements Section */}
          <section className="achievements-section">
            <div className="achievements-header">
              <h2 className="achievements-title">Recent Achievements</h2>
              <button className="view-all-btn" onClick={() => onNavigate?.('achievements')}>
                <img src={viewAllBtnImg} alt="View all" />
              </button>
            </div>

            <div className="achievements-grid">
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
                <h3>Mastermind</h3>
                <p>Complete Module 4</p>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
