import { useState, useEffect } from 'react';
import Navbar from '../../components/Sidebar/Sidebar';
import './LessonNavigation.css';
import { CURRICULUM, getStageNumber } from '../../data/curriculum';
import type { Section } from '../../data/curriculum';
import { fetchCurriculum, fetchStudentProgress } from '../../utils/api';
import type { StudentProgress } from '../../utils/api';

const sunImg = '/images/Sun.png';
const cloud1Img = '/images/Cloud 1.png';
const cloud2Img = '/images/Cloud 2.png';
const cloud3Img = '/images/Cloud 3.png';
const cloud5Img = '/images/Cloud 5.png';
const cloud6Img = '/images/Cloud 6.png';
const mascotImg = '/images/Tier 4 Pass-and-Flag.png';

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

const CheckCircleIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#2ECC71"/>
    <path d="M8 12.5L10.5 15L16 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CarouselArrowIcon = ({ direction }: { direction: 'left' | 'right' }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: direction === 'left' ? 'rotate(180deg)' : 'none' }}>
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface LessonNavigationProps {
  onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice') => void;
  unlockedStages: number[];
  onStartLesson: (stageId: number) => void;
}

export default function LessonNavigation({ onNavigate, unlockedStages, onStartLesson }: LessonNavigationProps) {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [sectionPages, setSectionPages] = useState<Record<string, number>>({});
  const [curriculumData, setCurriculumData] = useState<Section[]>(CURRICULUM);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [showSectionPicker, setShowSectionPicker] = useState<boolean>(false);
  const [hasAutoScrolled, setHasAutoScrolled] = useState<boolean>(false);

  useEffect(() => {
    // 1. Fetch student progress & grade level if student is logged in
    const storedStudent = localStorage.getItem('elocia_current_student');
    let studentGrade: number | undefined;

    if (storedStudent) {
      try {
        const student = JSON.parse(storedStudent);
        if (student.grade_level) {
          studentGrade = Number(student.grade_level);
        }
        if (student.id) {
          fetchStudentProgress(student.id).then(prog => {
            if (prog) setStudentProgress(prog);
          });
        }
      } catch (e) {
        console.error('Error parsing stored student:', e);
      }
    }

    // 2. Fetch live dynamic curriculum matching the student's grade level
    fetchCurriculum(studentGrade).then(sections => {
      if (sections) {
        setCurriculumData(sections);
      }
    });
  }, [unlockedStages]);

  // 3. Auto-scroll to current active stage on page load (so student lands right where they need to learn)
  useEffect(() => {
    if (hasAutoScrolled || curriculumData.length === 0) return;

    // Determine target active stage: highest unlocked stage not yet passed, or highest unlocked
    const unlockedList = studentProgress?.unlocked_stages || unlockedStages || [1];
    let targetStageId = unlockedList[unlockedList.length - 1];

    if (studentProgress?.stages) {
      const activeUnpassed = studentProgress.stages.find(s => s.unlocked && !s.passed);
      if (activeUnpassed) {
        targetStageId = activeUnpassed.stage_id;
      }
    }

    // Ensure the carousel page containing this stage is opened
    curriculumData.forEach((section, idx) => {
      const stages = section.units.flatMap(u => u.stages).sort((a, b) => a.id - b.id);
      const stageIdx = stages.findIndex(s => s.id === targetStageId);
      if (stageIdx !== -1) {
        const targetPage = Math.floor(stageIdx / 3);
        const sectionKey = `${section.id}-${idx}`;
        setSectionPages(prev => ({ ...prev, [sectionKey]: targetPage }));
      }
    });

    // Smooth scroll to the target stage card
    const timer = setTimeout(() => {
      const targetCard = document.querySelector(`[data-stage-id="${targetStageId}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHasAutoScrolled(true);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [curriculumData, studentProgress, unlockedStages, hasAutoScrolled]);

  const scrollToSection = (sectionKey: string) => {
    const el = document.getElementById(sectionKey);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowSectionPicker(false);
    }
  };

  const handleStageClick = (stageId: number, isLocked: boolean) => {
    if (isLocked) return;
    if (selectedStage === stageId) {
      // If clicking already selected stage, start it immediately
      onStartLesson(stageId);
    } else {
      setSelectedStage(stageId);
      // Smooth scroll to the details card
      setTimeout(() => {
        const detailsEl = document.querySelector('.stage-details-wrapper');
        if (detailsEl) {
          detailsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  };

  // Gather all stages across all sections and units dynamically created by the teacher
  const allStages = curriculumData.flatMap(sec => sec.units.flatMap(u => u.stages));

  const selectedStageData = selectedStage 
    ? allStages.find(s => s.id === selectedStage) 
    : null;

  const validSections = curriculumData.filter(section => section.units && section.units.some(u => u.stages && u.stages.length > 0));

  return (
    <div className="app-layout">
      <Navbar onNavigate={onNavigate} activeTab="learn" />

      <div className="main-content-area">

        <div className="clouds-wrapper">
          <img src={sunImg} alt="Sun" className="bg-decor sun" />
          <img src={cloud1Img} alt="Cloud 1" className="bg-decor cloud-1" />
          <img src={cloud2Img} alt="Cloud 2" className="bg-decor cloud-2" />
          <img src={cloud3Img} alt="Cloud 3" className="bg-decor cloud-3" />
          <img src={cloud5Img} alt="Cloud 5" className="bg-decor cloud-5" />
          <img src={cloud6Img} alt="Cloud 6" className="bg-decor cloud-6" />
        </div>

        {/* Quick-Jump Section Navigator (Floating Pill for 10+ Sections) */}
        {validSections.length > 1 && (
          <div className="section-quickjump-container">
            <button
              type="button"
              className="section-quickjump-trigger"
              onClick={() => setShowSectionPicker(prev => !prev)}
              title="Jump to Section"
            >
              <span>🧭</span>
              <span className="quickjump-text">Jump to Section</span>
              <span className="quickjump-badge">{validSections.length}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showSectionPicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showSectionPicker && (
              <div className="section-quickjump-dropdown">
                <div className="quickjump-dropdown-header">Curriculum Sections</div>
                <div className="quickjump-dropdown-list">
                  {validSections.map((sec, idx) => {
                    const secStages = sec.units.flatMap(u => u.stages);
                    const passedCount = secStages.filter(st => {
                      const stInfo = studentProgress?.stages.find(s => s.stage_id === st.id);
                      return stInfo && stInfo.passed;
                    }).length;
                    const isFullyCompleted = passedCount > 0 && passedCount === secStages.length;

                    return (
                      <button
                        key={`${sec.id}-${idx}`}
                        type="button"
                        className="quickjump-item"
                        onClick={() => scrollToSection(`sec-node-${sec.id}-${idx}`)}
                      >
                        <div className="quickjump-item-info">
                          <span className="quickjump-item-title">{sec.title}</span>
                          <span className="quickjump-item-stats">
                            {passedCount}/{secStages.length} Stages Completed
                          </span>
                        </div>
                        {isFullyCompleted ? (
                          <span className="quickjump-star" title="Section Completed">⭐</span>
                        ) : (
                          <span className="quickjump-arrow">→</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="map-container">
          {curriculumData.length === 0 || curriculumData.every(sec => sec.units.every(u => u.stages.length === 0)) ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 32px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '28px',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
              border: '4px solid #F59E0B',
              maxWidth: '460px',
              margin: '40px auto',
              textAlign: 'center',
              zIndex: 10
            }}>
              <img
                src={mascotImg}
                alt="Mascot"
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'contain',
                  marginBottom: '16px'
                }}
              />
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#78350F',
                marginBottom: '8px',
                fontFamily: 'Quicksand, sans-serif'
              }}>
                Welcome to Your Lesson Map!
              </h2>
              <p style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#92400E',
                maxWidth: '340px',
                margin: 0,
                lineHeight: 1.4
              }}>
                Your teacher is preparing your lessons. Check back soon for fun sign language activities!
              </p>
            </div>
          ) : (
            curriculumData
              .filter(section => section.units && section.units.some(u => u.stages && u.stages.length > 0))
              .map((section, idx) => {
                const stages = section.units
                  .flatMap(u => u.stages)
                  .sort((a, b) => a.id - b.id);
                
                const sectionKey = `${section.id}-${idx}`;
                const sectionDomId = `sec-node-${section.id}-${idx}`;
                const currentPage = sectionPages[sectionKey] || 0;
                const itemsPerPage = 3;
                const totalPages = Math.ceil(stages.length / itemsPerPage);
                const startIndex = currentPage * itemsPerPage;
                const visibleStages = stages.slice(startIndex, startIndex + itemsPerPage);

                // Section completion status
                const passedStagesCount = stages.filter(st => {
                  const sInfo = studentProgress?.stages.find(s => s.stage_id === st.id);
                  return sInfo && sInfo.passed;
                }).length;
                const isSectionComplete = passedStagesCount > 0 && passedStagesCount === stages.length;

                const handlePrevPage = () => {
                  setSectionPages(prev => ({
                    ...prev,
                    [sectionKey]: Math.max(0, (prev[sectionKey] || 0) - 1)
                  }));
                };

                const handleNextPage = () => {
                  setSectionPages(prev => ({
                    ...prev,
                    [sectionKey]: Math.min(totalPages - 1, (prev[sectionKey] || 0) + 1)
                  }));
                };

                return (
                  <div key={sectionKey} id={sectionDomId} className="section-group">
                    <div className="section-banner">
                      <span>{section.title}</span>
                      {isSectionComplete && (
                        <span style={{ marginLeft: '10px', fontSize: '1.2rem' }} title="Section Completed!">⭐</span>
                      )}
                    </div>

                    <div className="stages-carousel-wrapper">
                      {stages.length > itemsPerPage && currentPage > 0 && (
                        <button
                          className="carousel-arrow-btn arrow-prev"
                          onClick={handlePrevPage}
                          title="Previous Stages"
                          aria-label="Previous Stages"
                        >
                          <CarouselArrowIcon direction="left" />
                        </button>
                      )}

                      <div className="stages-path">
                        <div className="path-line"></div>

                        {visibleStages.map((stage) => {
                          const originalStageIdx = stages.findIndex(s => s.id === stage.id);
                          const isLocked = !unlockedStages.includes(stage.id);
                          const stageInfo = studentProgress?.stages.find(s => s.stage_id === stage.id);
                          const isCompleted = !!(stageInfo && stageInfo.passed);
                          const cardStateClass = isLocked ? 'locked-card' : (isCompleted ? 'completed-card' : 'active-card');
                          const xpPoints = (stage.items?.length || 1) * 10;
                      
                          return (
                            <div
                              key={stage.id}
                              data-stage-id={stage.id}
                              className={`stage-card ${cardStateClass} ${selectedStage === stage.id ? 'selected' : ''}`}
                              onClick={() => handleStageClick(stage.id, isLocked)}
                              role="button"
                              tabIndex={isLocked ? -1 : 0}
                            >
                              {isLocked ? (
                                <>
                                  <div className="stage-text-group">
                                    <span className="stage-label">Stage</span>
                                    <span className="stage-number">{originalStageIdx + 1}</span>
                                  </div>
                                  <div className="icon-container">
                                    <LockIcon />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="card-top-badge-row">
                                    <span className={`status-pill ${isCompleted ? 'pill-completed' : 'pill-active'}`}>
                                      {isCompleted ? 'Completed' : 'Stage ' + (originalStageIdx + 1)}
                                    </span>
                                    <div className="card-mini-icon">
                                      {isCompleted ? <CheckCircleIcon /> : <PlayIcon />}
                                    </div>
                                  </div>

                                  <div className="card-body-text">
                                    <h4 className="card-stage-title">{stage.title}</h4>
                                    <p className="card-stage-subtitle">
                                      {stage.items?.length ? `${stage.items.length} signs to learn` : 'Fun sign activities'}
                                    </p>
                                  </div>

                                  <div className="card-footer-row">
                                    <span className="card-reward-pts">⭐ {xpPoints} pts</span>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {stages.length > itemsPerPage && currentPage < totalPages - 1 && (
                        <button
                          className="carousel-arrow-btn arrow-next"
                          onClick={handleNextPage}
                          title="Next Stages"
                          aria-label="Next Stages"
                        >
                          <CarouselArrowIcon direction="right" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
          )}

          {selectedStageData && (
            <div className="stage-modal-overlay" onClick={() => setSelectedStage(null)}>
              <div className="stage-popover-card" onClick={(e) => e.stopPropagation()}>
                <img src={mascotImg} alt="Stage Mascot" className="details-mascot" />

                <div className="details-content">
                  <div className="details-header">
                    <span className="details-stage-name">Stage {getStageNumber(selectedStageData.id, curriculumData)}</span>
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
                        {(() => {
                          const stageInfo = studentProgress?.stages.find(s => s.stage_id === selectedStageData.id);
                          if (stageInfo && stageInfo.passed) {
                            return (
                              <span className="progress-text" style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                                {"\u2B50"} {stageInfo.stars}/5 Stars ({stageInfo.best_score}%)
                              </span>
                            );
                          }
                          return (
                            <span className="progress-text">Progress <span className="progress-highlight">{stageInfo?.completed_signs || 0}/{selectedStageData.items.length} completed</span></span>
                          );
                        })()}
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

                <button 
                  className="close-popover-btn" 
                  onClick={() => setSelectedStage(null)}
                  title="Close"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
