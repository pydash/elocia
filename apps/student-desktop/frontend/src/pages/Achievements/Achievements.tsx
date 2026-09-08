import { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/Sidebar/Sidebar';
import { ACHIEVEMENTS, loadStudentStats, type StudentStats } from '../../data/achievements';
import './Achievements.css';

const backButtonImg = '/images/Back Button.png';

interface AchievementsProps {
  onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice') => void;
}

type CategoryType = 'all' | 'mastery' | 'streak' | 'games' | 'resilience' | 'milestones';

export default function Achievements({ onNavigate }: AchievementsProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [stats, setStats] = useState<StudentStats>(() => {
    const saved = localStorage.getItem('elocia_current_student');
    if (saved) {
      try {
        const student = JSON.parse(saved);
        return loadStudentStats(student);
      } catch {
        // Fallback
      }
    }
    return loadStudentStats();
  });

  useEffect(() => {
    const saved = localStorage.getItem('elocia_current_student');
    if (saved) {
      try {
        const student = JSON.parse(saved);
        if (student.id) {
          fetch(`http://localhost:8000/users/${student.id}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.name) {
                setStats(loadStudentStats(data));
              }
            })
            .catch(err => console.warn('Could not fetch user stats:', err));
        }
      } catch (e) {
        console.warn('Error reading current student for stats refresh:', e);
      }
    }
  }, []);

  const filteredAchievements = useMemo(() => {
    if (activeCategory === 'all') return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter(a => a.category === activeCategory);
  }, [activeCategory]);

  const unlockedCount = useMemo(() => {
    return ACHIEVEMENTS.filter(a => a.getProgress(stats) >= a.maxProgress).length;
  }, [stats]);

  const progressPercent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);
  return (
    <div className="achievements-page-container">
      {/* Sidebar */}
      <Navbar activeTab="profile" onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="achievements-main">
        {/* Background Decorative Pattern */}
        <div className="achievements-bg-pattern">
          <span className="bg-icon icon-1">{"\u2B50"}</span>
          <span className="bg-icon icon-2">{"\uD83C\uDFC6"}</span>
          <span className="bg-icon icon-3">{"\uD83D\uDD25"}</span>
          <span className="bg-icon icon-4">{"\u2B50"}</span>
          <span className="bg-icon icon-5">{"\uD83C\uDF85"}</span>
        </div>

        <div className="achievements-content-scroll">
          <header className="achievements-page-header">
            <button 
              className="achievements-back-btn" 
              onClick={() => onNavigate?.('profile')}
              title="Back to Profile"
            >
              <img src={backButtonImg} alt="Back" />
            </button>
            <h1 className="page-title">All Achievements</h1>
            <div className="spacer"></div>
          </header>

          {/* Overview Banner */}
          <section className="achievements-stats-banner">
            <div className="banner-left">
              <div className="banner-trophy-icon">{"\uD83C\uDFC6"}</div>
              <div className="banner-text">
                <h2>{unlockedCount} of {ACHIEVEMENTS.length} Badges Unlocked</h2>
                <p>Keep practicing your signs to unlock more badges and rewards!</p>
              </div>
            </div>
            <div>
              <div style={{ textAlign: 'right', fontWeight: 800, color: '#3B82F6', fontSize: '1.1rem' }}>
                {progressPercent}% Complete
              </div>
              <div className="banner-progress-bar-container">
                <div className="banner-progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          </section>

          {/* Category Filter Pills */}
          <div className="achievements-filters">
            <button 
              className={`achievement-filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              {"\u2728"} All Badges
            </button>
            <button 
              className={`achievement-filter-btn ${activeCategory === 'mastery' ? 'active' : ''}`}
              onClick={() => setActiveCategory('mastery')}
            >
              {"\uD83D\uDD90\uFE0F"} FSL Mastery
            </button>
            <button 
              className={`achievement-filter-btn ${activeCategory === 'streak' ? 'active' : ''}`}
              onClick={() => setActiveCategory('streak')}
            >
              {"\uD83D\uDD25"} Streaks
            </button>
            <button 
              className={`achievement-filter-btn ${activeCategory === 'games' ? 'active' : ''}`}
              onClick={() => setActiveCategory('games')}
            >
              {"\uD83C\uDFAE"} Mini-Games
            </button>
            <button 
              className={`achievement-filter-btn ${activeCategory === 'resilience' ? 'active' : ''}`}
              onClick={() => setActiveCategory('resilience')}
            >
              {"\uD83D\uDEE1\uFE0F"} Practice & Growth
            </button>
            <button 
              className={`achievement-filter-btn ${activeCategory === 'milestones' ? 'active' : ''}`}
              onClick={() => setActiveCategory('milestones')}
            >
              {"\uD83C\uDF96\uFE0F"} Milestones
            </button>
          </div>
          
          {/* Achievements Dynamic Grid */}
          <div className="achievements-full-grid">
            {filteredAchievements.map((ach) => {
              const currentProgress = ach.getProgress(stats);
              const isUnlocked = currentProgress >= ach.maxProgress;
              const fillPercent = Math.min(100, Math.round((currentProgress / ach.maxProgress) * 100));

              return (
                <div 
                  key={ach.id} 
                  className={`achievement-card ${isUnlocked ? 'active-border' : 'locked'}`}
                  style={{
                    borderColor: isUnlocked ? ach.borderColor : '#E2E8F0',
                    boxShadow: isUnlocked ? '0 8px 24px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  <div 
                    className="achievement-icon-circle"
                    style={{
                      background: isUnlocked ? ach.color : '#F1F5F9',
                      border: `2px solid ${isUnlocked ? ach.borderColor : '#CBD5E1'}`,
                      fontSize: '2.4rem'
                    }}
                  >
                    {isUnlocked ? ach.icon : '\uD83D\uDD12'}
                  </div>

                  <h3 style={{ color: isUnlocked ? '#1E293B' : '#64748B' }}>{ach.title}</h3>
                  <p>{ach.description}</p>

                  {/* Progress Tracker */}
                  <div className="achievement-progress-wrapper">
                    <div className="achievement-progress-track">
                      <div 
                        className="achievement-progress-bar"
                        style={{
                          width: `${fillPercent}%`,
                          background: isUnlocked ? ach.borderColor : '#94A3B8'
                        }}
                      ></div>
                    </div>
                    <div className="achievement-progress-label">
                      <span>{ach.formatProgress ? ach.formatProgress(currentProgress, ach.maxProgress) : `${fillPercent}%`}</span>
                      <span>{isUnlocked ? '\u2705 Unlocked' : `${fillPercent}%`}</span>
                    </div>
                  </div>

                  {isUnlocked && (
                    <span className="unlocked-pill">{"\u2728"} Mastered</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
