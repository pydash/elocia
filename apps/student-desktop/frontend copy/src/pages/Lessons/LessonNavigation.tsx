<<<<<<<< HEAD:apps/student-desktop/frontend/src/pages/Lessons/Lessons.tsx
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar'; 
import './Lessons.css'; 

// Assets
import sunImg from '../../assets/Sun.png';
import cloud1Img from '../../assets/Cloud 1.png';
import cloud2Img from '../../assets/Cloud 2.png';
import cloud3Img from '../../assets/Cloud 3.png';
import cloud5Img from '../../assets/Cloud 5.png';
import cloud6Img from '../../assets/Cloud 6.png'; 
import mascotImg from '../../assets/Tier 4 Pass-and-Flag.png';
========
import { useState } from 'react';
import Navbar from '../../components/Sidebar/Sidebar';
import './LessonNavigation.css';
import { CURRICULUM } from '../../data/curriculum';

const sunImg = '/images/Sun.png';
const cloud1Img = '/images/Cloud 1.png';
const cloud2Img = '/images/Cloud 2.png';
const cloud3Img = '/images/Cloud 3.png';
const cloud5Img = '/images/Cloud 5.png';
const cloud6Img = '/images/Cloud 6.png';
const mascotImg = '/images/Tier 4 Pass-and-Flag.png';
>>>>>>>> 760f75e03194bc04076708af8826962e2e8fd3c6:apps/student-desktop/frontend copy/src/pages/Lessons/LessonNavigation.tsx

const PlayIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="22" fill="#FF9800"/>
    <path d="M17 14.5L31 22L17 29.5V14.5Z" fill="white" stroke="white" strokeWidth="3" strokeLinejoin="round"/>
  </svg>
);

const LockIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7f8c8d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const RoundsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bdc3c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const ButtonPlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

interface LessonNavigationProps {
  onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings') => void;
  unlockedStages: number[];
  onStartLesson: (stageId: number) => void;
}

export default function LessonNavigation({ onNavigate, unlockedStages, onStartLesson }: LessonNavigationProps) {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const handleStageClick = (stageId: number, isLocked: boolean) => {
    if (isLocked) return;
    setSelectedStage(prev => (prev === stageId ? null : stageId));
  };

  // We display the first Unit of the first Section for this map view
  const currentSection = CURRICULUM[0];
  const currentUnit = currentSection.units[0];

  const selectedStageData = selectedStage ? currentUnit.stages.find(s => s.id === selectedStage) : null;

  return (
    <div className="app-layout">
<<<<<<<< HEAD:apps/student-desktop/frontend/src/pages/Lessons/Lessons.tsx
      <Sidebar /> 
========
      <Navbar onNavigate={onNavigate} activeTab="learn" />
>>>>>>>> 760f75e03194bc04076708af8826962e2e8fd3c6:apps/student-desktop/frontend copy/src/pages/Lessons/LessonNavigation.tsx

      <div className="main-content-area">

        <div className="clouds-wrapper">
          <img src={sunImg} alt="Sun" className="bg-decor sun" />
          <img src={cloud1Img} alt="Cloud 1" className="bg-decor cloud-1" />
          <img src={cloud2Img} alt="Cloud 2" className="bg-decor cloud-2" />
          <img src={cloud3Img} alt="Cloud 3" className="bg-decor cloud-3" />
          <img src={cloud5Img} alt="Cloud 5" className="bg-decor cloud-5" />
          <img src={cloud6Img} alt="Cloud 6" className="bg-decor cloud-6" />
        </div>

        <div className="map-container">

          <div className="section-banner">
            {currentSection.title}, {currentUnit.title}
          </div>

          <div className="stages-path">
            <div className="path-line"></div>

            {currentUnit.stages.map((stage) => {
              const isLocked = !unlockedStages.includes(stage.id);
              
              return (
                <div
                  key={stage.id}
                  className={`stage-card ${isLocked ? 'locked-card' : 'active-card'} ${selectedStage === stage.id ? 'selected' : ''}`}
                  onClick={() => handleStageClick(stage.id, isLocked)}
                  role="button"
                  tabIndex={isLocked ? -1 : 0}
                >
                  <div className="stage-text-group">
                    <span className="stage-label">Stage</span>
                    <span className="stage-number">{stage.id}</span>
                  </div>
                  <div className="icon-container">
                    {isLocked ? <LockIcon /> : <PlayIcon />}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedStageData && (
            <div className="stage-details-wrapper">
              <div className="details-rectangle">

                <img src={mascotImg} alt="Stage Mascot" className="details-mascot" />

                <div className="details-content">

                  <div className="details-header">
                    <span className="details-stage-name">Stage {selectedStageData.id}</span>
                    <h3 className="details-stage-title">{selectedStageData.title}</h3>
                    <p className="details-stage-description">
                      {selectedStageData.description}
                    </p>
                  </div>

                  <div className="details-action-row">
                    <div className="details-stats">
                      <div className="stat-row">
                        <RoundsIcon />
                        <span>{selectedStageData.items.length} Rounds</span>
                      </div>
                      <div className="stat-row">
                        <span className="progress-text">Progress <span className="progress-highlight">0/{selectedStageData.items.length} completed</span></span>
                      </div>
                    </div>

                    <button 
                      className="start-lesson-btn"
                      onClick={() => onStartLesson(selectedStageData.id)}
                    >
                      <ButtonPlayIcon />
                      Start Learning
                    </button>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
