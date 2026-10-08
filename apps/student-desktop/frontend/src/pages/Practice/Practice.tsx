import { useState, useEffect } from 'react';
import './Practice.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import { CURRICULUM } from '../../data/curriculum';
import type { Section } from '../../data/curriculum';
import { fetchCurriculum, fetchStudentProgress, fetchEducationalVideos, fetchNeedsPractice, API_BASE } from '../../utils/api';
import type { StudentProgress, EducationalVideoItem, PracticeItem } from '../../utils/api';

// Assuming images are in public/images
const seeItSignItImg = '/images/See it, Sign it!.png';
const magicFingersImg = '/images/Magic fingers.png';
const puzzleSignImg = '/images/Puzzle Sign.png';
const viewAllBtnImg = '/images/View all Button.png';

interface PracticeProps {
  onNavigate: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign' | 'see-it-sign-it' | 'magic-fingers') => void;
  onStartLesson?: (stageId: number, practiceMode?: boolean, drillSigns?: string[] | null) => void;
}

export default function Practice({ onNavigate, onStartLesson }: PracticeProps) {
  const [educationalVideos, setEducationalVideos] = useState<EducationalVideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<EducationalVideoItem | null>(null);
  const [showAllVideos, setShowAllVideos] = useState<boolean>(false);
  const [showAllPractice, setShowAllPractice] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [curriculumData, setCurriculumData] = useState<Section[]>(CURRICULUM);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [practiceItems, setPracticeItems] = useState<PracticeItem[]>([]);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }
    return url;
  };

  useEffect(() => {
    // 1. Get student grade level if logged in
    const rawStudent = localStorage.getItem('elocia_current_student');
    let studentGrade: number | undefined;
    let studentId: string | undefined;

    if (rawStudent) {
      try {
        const student = JSON.parse(rawStudent);
        if (student.grade_level) studentGrade = Number(student.grade_level);
        if (student.id) studentId = student.id;
      } catch (e) {
        console.error('Failed to parse current student for practice:', e);
      }
    }

    // 2. Load dynamic curriculum for this student's grade
    fetchCurriculum(studentGrade).then(sections => {
      if (sections) {
        setCurriculumData(sections);
      }
    });

    // 3. Load educational videos from backend for this student's grade
    fetchEducationalVideos(studentGrade).then(videos => {
      if (videos) {
        setEducationalVideos(videos);
      }
    });

    // 4. Load student progress, needs practice items & focus drill
    if (studentId) {
      fetchStudentProgress(studentId).then((prog) => {
        if (prog) {
          setStudentProgress(prog);
        }
      });
      fetchNeedsPractice(studentId).then((items) => {
        setPracticeItems(items || []);
      });
    }
  }, []);

  return (
    <div className="practice-layout">
      <Sidebar activeTab="practice" onNavigate={onNavigate} />
      
      <main className="practice-main-content">
        <div className="practice-scroll-container">
          {/* Header */}
          <header className="practice-header">
            <div className="practice-header-content">
              <h1 className="practice-title">Time to Practice</h1>
              <p className="practice-subtitle">Keep your hands flexible and streak alive!</p>
            </div>
          </header>


          {/* Section: Keep Practicing (Focus Drill Cards from user screenshot) */}
          <section className="practice-section keep-practicing">
            <div className="section-header kp-section-header">
              <div className="section-title-group">
                <h2>Keep Practicing</h2>
                <p>Signs to help you build your skills</p>
              </div>
              <button 
                className="view-all-pill-btn"
                onClick={() => setShowAllPractice(true)}
                title="View all practice signs"
              >
                <span>View all</span>
                <span>→</span>
              </button>
            </div>

            <div className="kp-cards-row">
              {practiceItems.length > 0 ? (
                practiceItems.slice(0, 4).map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`kp-card ${item.color}`}
                    onClick={() => {
                      if (onStartLesson) {
                        onStartLesson(item.stage_id, true, [item.sign]);
                      } else {
                        onNavigate('setup');
                      }
                    }}
                    title={item.reason || `Practice sign: ${item.sign}`}
                  >
                    {/* Badge ribbon if flagged or low accuracy */}
                    {item.score < 60 && (
                      <div className="kp-card-badge" title="Flagged for practice">
                        !
                      </div>
                    )}
                    <div className="kp-number">{item.sign}</div>
                    <div className="kp-stage">{item.section_label}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', width: '100%', borderRadius: '16px', background: '#f8fafc', border: '2px dashed #cbd5e1', fontSize: '14px', fontWeight: 500 }}>
                  🎉 Great job! No signs currently flagged for extra practice. Keep up the good work!
                </div>
              )}
            </div>
          </section>

          {/* Section 1: Educational Videos */}
          <section className="practice-section educational-videos">
            <div className="section-header">
              <div className="section-title-group">
                <h2>Educational Videos</h2>
                <p>Learn new signs with videos</p>
              </div>
              <button 
                className="view-all-btn"
                onClick={() => setShowAllVideos(true)}
                title="View all educational videos"
              >
                <img src={viewAllBtnImg} alt="View all" />
              </button>
            </div>

            <div className="video-cards-row">
              {educationalVideos.length > 0 ? (
                <>
                  {educationalVideos.slice(0, 4).map((video) => (
                    <div 
                      key={video.id} 
                      className="video-card" 
                      onClick={() => {
                        setVideoError(false);
                        setSelectedVideo(video);
                      }}
                      style={{ cursor: 'pointer' }}
                      title={`Click to watch: ${video.title}`}
                    >
                      <div className="video-thumbnail">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url.startsWith('http') ? video.thumbnail_url : `${API_BASE}${video.thumbnail_url}`} 
                            alt={video.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div className="science-placeholder-art">
                            <div className="science-doodle dna"></div>
                            <div className="science-doodle stars"></div>
                            <div className="science-doodle molecules"></div>
                            <div className="science-text-container">
                              <span className="science-text">{video.subject.toUpperCase()}</span>
                              <span className="science-sub">{video.title.toUpperCase()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="video-info">
                        <span className="grade-badge">Grade {video.grade_level}</span>
                        <h3 className="video-title">{video.title}</h3>
                        <p className="video-desc">{video.description || `Learn ${video.subject} concepts with Filipino Sign Language.`}</p>
                      </div>
                    </div>
                  ))}
                  {/* Fill out to 4 slots so layout never stretches single cards awkwardly */}
                  {Array.from({ length: Math.max(0, 4 - Math.min(educationalVideos.length, 4)) }).map((_, idx) => (
                    <div key={`slot-placeholder-${idx}`} className="video-card placeholder-card">
                      <div className="video-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '32px' }}>
                        🎬
                      </div>
                      <div className="video-info" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
                          Coming Soon
                        </span>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                          More lesson videos will appear here
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1', borderRadius: '16px', background: '#f8fafc', border: '2px dashed #cbd5e1', fontSize: '14px', fontWeight: 500 }}>
                  📹 No educational videos uploaded yet. Videos uploaded by teachers will appear here!
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Mini Games */}
          <section className="practice-section mini-games">
            <div className="section-header centered">
              <h2>Mini Games</h2>
              <p>Try playing mini games that is fun to play!</p>
            </div>

            <div className="games-row">
              <img 
                src={seeItSignItImg} 
                alt="See it, Sign it!" 
                className="game-img" 
                onClick={() => onNavigate('see-it-sign-it')}
              />
              <img 
                src={puzzleSignImg} 
                alt="Puzzle sign" 
                className="game-img" 
                onClick={() => onNavigate('puzzle-sign')}
              />
              <img 
                src={magicFingersImg} 
                alt="Magic Fingers" 
                className="game-img" 
                onClick={() => onNavigate('magic-fingers')}
              />
            </div>
          </section>

          {/* Section 4: Review Past Stages */}
          <section className="practice-section review-stages">
            <div className="section-header centered">
              <h2>Review Past Stages</h2>
              <p>You can practice your completed stages here!</p>
            </div>

            <div className="practice-section-banner">
              {curriculumData[0]?.title || "SECTION 1"}, {curriculumData[0]?.units[0]?.title || "UNIT 1"}
            </div>

            <div className="timeline-wrapper">
              <div className="timeline-cards">
                {(() => {
                  const unitStages = curriculumData[0]?.units[0]?.stages || [];
                  const unlockedList = studentProgress?.unlocked_stages || [1];

                  return unitStages.map((stage, idx) => {
                    const isUnlocked = unlockedList.includes(stage.id);
                    const stageInfo = studentProgress?.stages.find(s => s.stage_id === stage.id);
                    const isPassed = stageInfo?.passed || false;
                    const isNextUnlocked = unlockedList.includes(stage.id + 1);

                    if (!isUnlocked) {
                      return (
                        <div key={stage.id} className="timeline-card-wrapper locked">
                          <div className="practice-stage-card locked-card">
                            <h4>STAGE</h4>
                            <span className="locked-number">{stage.id}</span>
                            <span className="lock-icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7f8c8d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0110 0v4"></path>
                              </svg>
                            </span>
                          </div>
                        </div>
                      );
                    }

                    const cardStateClass = isPassed ? "completed" : "active";
                    const borderClass = isPassed ? "" : "border-orange";

                    return (
                      <div key={stage.id} className={`timeline-card-wrapper ${cardStateClass}`}>
                        <div 
                          className={`practice-stage-card ${borderClass}`}
                          onClick={() => {
                            try {
                              const reviewed: number[] = JSON.parse(localStorage.getItem('elocia_reviewed_stages') || '[]');
                              if (!reviewed.includes(stage.id)) {
                                reviewed.push(stage.id);
                                localStorage.setItem('elocia_reviewed_stages', JSON.stringify(reviewed));
                              }
                            } catch (err) {
                              console.warn('Failed to update reviewed stages:', err);
                            }

                            if (onStartLesson) {
                              onStartLesson(stage.id, true);
                            } else {
                              onNavigate('setup');
                            }
                          }}
                          title={`Click to practice ${stage.title}`}
                        >
                          <div className="stage-thumbnail">
                            <div className="wooden-blocks-mock">
                              <div className="wood-block b-red">4</div>
                              <div className="wood-block b-blue">5</div>
                              <div className="wood-block b-green">1</div>
                              <div className="wood-block b-orange">2</div>
                              <div className="wood-block b-purple">3</div>
                            </div>
                          </div>
                          <div className="stage-info">
                            <span className="grade-badge">Grade 1</span>
                            <h4>{stage.title}</h4>
                            <p>{stage.description}</p>
                            <div className="stage-footer">
                              <span className="star-icon">⭐</span>
                              <span>{stageInfo ? `${stageInfo.stars}/5 Stars (${stageInfo.best_score}%)` : `${stage.items.length} Signs`}</span>
                            </div>
                          </div>
                        </div>
                        {idx < unitStages.length - 1 && (
                          <div className={`timeline-segment ${isNextUnlocked ? "segment-green" : "segment-gray"}`}></div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              <button className="next-arrow-btn" onClick={() => onNavigate('navigation')} title="Go to Learning Map">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Educational Video Player Modal */}
      {selectedVideo && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '28px',
              maxWidth: '840px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '3px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '2px solid #F1F5F9' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#e0f2fe', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {selectedVideo.subject}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: '#fef3c7', color: '#b45309' }}>
                    Grade {selectedVideo.grade_level}
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '2px 0 0 0', color: '#0f172a' }}>
                  {selectedVideo.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedVideo(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#64748b',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                title="Close Video"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {videoError ? (
                <div style={{ color: '#f87171', textAlign: 'center', padding: '24px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>⚠️ Video Not Available</p>
                  <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>The video file could not be loaded or the URL is unreachable.</p>
                </div>
              ) : selectedVideo.video_url.includes('youtube.com') || selectedVideo.video_url.includes('youtu.be') ? (
                <iframe
                  src={getEmbedUrl(selectedVideo.video_url)}
                  title={selectedVideo.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video 
                  key={selectedVideo.id}
                  controls 
                  autoPlay
                  playsInline
                  onError={() => setVideoError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                  <source src={selectedVideo.video_url} type="video/mp4" />
                  <source src={`http://127.0.0.1:8000${selectedVideo.video_url}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Description Footer */}
            {selectedVideo.description && (
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                  {selectedVideo.description}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View All Educational Videos Full Screen View */}
      {showAllVideos && (
        <div 
          className="practice-layout"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#F8F9CC',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Quicksand', sans-serif"
          }}
        >
          {/* Top Navigation Bar with System Theme */}
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem 2.5rem',
            borderBottom: '3px solid rgba(0,0,0,0.06)',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => setShowAllVideos(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#ff9f43',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '10px 22px',
                  fontWeight: 800,
                  fontSize: '15px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(255, 159, 67, 0.35)',
                  transition: 'transform 0.15s, background-color 0.15s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f39c12';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff9f43';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                ← Back to Practice
              </button>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#38b6ff', letterSpacing: '-0.5px' }}>
                  Educational Videos
                </h1>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#4a4a4a' }}>
                  Showing all {educationalVideos.length} educational videos for your grade
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAllVideos(false)}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: '2px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 900,
                color: '#475569',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                transition: 'transform 0.15s, background-color 0.15s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#475569';
              }}
              title="Close Full Screen"
            >
              ✕
            </button>
          </header>

          {/* Full Screen Scrollable Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 3.5rem 5rem 3.5rem' }}>
            {educationalVideos.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px'
              }}>
                {educationalVideos.map((video) => (
                  <div 
                    key={video.id} 
                    className="video-card" 
                    onClick={() => {
                      setVideoError(false);
                      setSelectedVideo(video);
                    }}
                    style={{ cursor: 'pointer' }}
                    title={`Click to watch: ${video.title}`}
                  >
                    <div className="video-thumbnail">
                      {video.thumbnail_url ? (
                        <img 
                          src={video.thumbnail_url.startsWith('http') ? video.thumbnail_url : `${API_BASE}${video.thumbnail_url}`} 
                          alt={video.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div className="science-placeholder-art">
                          <div className="science-doodle dna"></div>
                          <div className="science-doodle stars"></div>
                          <div className="science-doodle molecules"></div>
                          <div className="science-text-container">
                            <span className="science-text">{video.subject.toUpperCase()}</span>
                            <span className="science-sub">{video.title.toUpperCase()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="video-info">
                      <span className="grade-badge">Grade {video.grade_level}</span>
                      <h3 className="video-title">{video.title}</h3>
                      <p className="video-desc">{video.description || `Learn ${video.subject} concepts with Filipino Sign Language.`}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '64px 32px',
                textAlign: 'center',
                color: '#64748b',
                borderRadius: '24px',
                background: '#ffffff',
                border: '2px dashed #cbd5e1',
                fontSize: '16px',
                maxWidth: '600px',
                margin: '40px auto',
                boxShadow: '0 6px 15px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>No Videos Uploaded Yet</h3>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#64748b' }}>
                  Educational videos uploaded by teachers will appear here for practice!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View All Keep Practicing Full Screen / Modal View */}
      {showAllPractice && (
        <div 
          className="practice-layout"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#F8F9CC',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Quicksand', sans-serif"
          }}
        >
          {/* Top Navigation Bar with System Theme */}
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem 2.5rem',
            borderBottom: '3px solid rgba(0,0,0,0.06)',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => setShowAllPractice(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#ff922b',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '10px 22px',
                  fontWeight: 800,
                  fontSize: '15px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(255, 146, 43, 0.35)',
                  transition: 'transform 0.15s, background-color 0.15s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f76707';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff922b';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                ← Back to Practice
              </button>
              <div>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#38b6ff', letterSpacing: '-0.5px' }}>
                  Keep Practicing (All Signs)
                </h1>
                <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#4a4a4a' }}>
                  Signs you struggled with or recommended for mastery drill ({practiceItems.length} signs)
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAllPractice(false)}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                border: '2px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 900,
                color: '#475569',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                transition: 'transform 0.15s, background-color 0.15s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#fee2e2';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#475569';
              }}
              title="Close Full Screen"
            >
              ✕
            </button>
          </header>

          {/* Full Screen Scrollable Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 3.5rem 5rem 3.5rem' }}>
            {practiceItems.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '24px'
              }}>
                {practiceItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`kp-card ${item.color}`}
                    onClick={() => {
                      setShowAllPractice(false);
                      if (onStartLesson) {
                        onStartLesson(item.stage_id, true, [item.sign]);
                      } else {
                        onNavigate('setup');
                      }
                    }}
                    style={{ height: '180px' }}
                    title={item.reason || `Practice sign: ${item.sign}`}
                  >
                    {item.score < 60 && (
                      <div className="kp-card-badge" title="Flagged for practice">
                        !
                      </div>
                    )}
                    <div className="kp-number">{item.sign}</div>
                    <div className="kp-stage">{item.section_label}</div>
                    <span style={{ fontSize: '12px', fontWeight: 700, marginTop: '8px', opacity: 0.85 }}>
                      Accuracy: {item.score}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '64px 32px',
                textAlign: 'center',
                color: '#64748b',
                borderRadius: '24px',
                background: '#ffffff',
                border: '2px dashed #cbd5e1',
                fontSize: '16px',
                maxWidth: '600px',
                margin: '40px auto',
                boxShadow: '0 6px 15px rgba(0,0,0,0.04)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>All Signs Mastered!</h3>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#64748b' }}>
                  You have no low-scoring signs flagged for practice. Awesome job!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
