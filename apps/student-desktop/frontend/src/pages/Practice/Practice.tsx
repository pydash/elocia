import './Practice.css';
import Sidebar from '../../components/Sidebar/Sidebar';

// Assuming images are in public/images
const seeItSignItImg = '/images/See it, Sign it!.png';
const magicFingersImg = '/images/Magic fingers.png';
const puzzleSignImg = '/images/Puzzle Sign.png';
const viewAllBtnImg = '/images/View all Button.png';

interface PracticeProps {
  onNavigate: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign' | 'see-it-sign-it' | 'magic-fingers') => void;
}

// Background decorative elements mapped for 15-20 scattered SVG icons
const backgroundDoodles = [
  { top: '5%', left: '10%', rot: '-15deg', svg: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' }, // star
  { top: '12%', right: '15%', rot: '20deg', svg: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z M9 9h.01 M15 9h.01 M9 14.5a4 4 0 0 0 6 0' }, // smiley
  { top: '25%', left: '8%', rot: '45deg', svg: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }, // box/gift
  { top: '35%', right: '8%', rot: '-10deg', svg: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3' }, // arrow out
  { top: '45%', left: '15%', rot: '15deg', svg: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' }, // star
  { top: '50%', right: '25%', rot: '-25deg', svg: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z M9 9h.01 M15 9h.01 M9 14.5a4 4 0 0 0 6 0' }, // smiley
  { top: '65%', left: '5%', rot: '30deg', svg: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01' }, // tag
  { top: '75%', right: '12%', rot: '-15deg', svg: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' }, // book
  { top: '85%', left: '20%', rot: '10deg', svg: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' }, // star
  { top: '95%', right: '35%', rot: '45deg', svg: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01' }, // tag
  { top: '15%', left: '40%', rot: '-35deg', svg: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' }, // building
  { top: '28%', right: '35%', rot: '25deg', svg: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z M9 9h.01 M15 9h.01 M9 14.5a4 4 0 0 0 6 0' }, // smiley
  { top: '55%', left: '45%', rot: '-10deg', svg: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3' }, // hand/arrow
  { top: '82%', left: '40%', rot: '15deg', svg: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' }, // star
  { top: '10%', right: '45%', rot: '-20deg', svg: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }, // box
  { top: '70%', right: '5%', rot: '-5deg', svg: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01' }, // tag
  { top: '90%', left: '5%', rot: '25deg', svg: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z M9 9h.01 M15 9h.01 M9 14.5a4 4 0 0 0 6 0' }, // smiley
  { top: '5%', right: '5%', rot: '10deg', svg: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' } // star
];

export default function Practice({ onNavigate }: PracticeProps) {
  return (
    <div className="practice-layout">
      <Sidebar activeTab="practice" onNavigate={onNavigate} />
      
      <main className="practice-main-content">
        {/* Background decorative elements */}
        <div className="practice-bg-decor">
          {backgroundDoodles.map((icon, idx) => (
            <svg 
              key={idx}
              className="doodle-icon"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{
                top: icon.top,
                left: icon.left,
                right: icon.right,
                transform: `rotate(${icon.rot}) scale(${Math.random() * 0.5 + 0.8})`
              }}
            >
              <path d={icon.svg} />
            </svg>
          ))}
        </div>

        <div className="practice-scroll-container">
          {/* Header */}
          <header className="practice-header">
            <div className="practice-header-content">
              <h1 className="practice-title">Time to Practice</h1>
              <p className="practice-subtitle">Keep your hands flexible and streak alive!</p>
            </div>
          </header>

          {/* Section 1: Keep Practicing */}
          <section className="practice-section keep-practicing">
            <div className="section-header kp-section-header">
              <div className="section-title-group">
                <h2>Keep Practicing</h2>
                <p>Signs to help you build your skills</p>
              </div>
              <button className="view-all-btn">
                <img src={viewAllBtnImg} alt="View all" />
              </button>
            </div>
            
            <div className="kp-cards-row">
              <div className="kp-card red">
                <div className="kp-number">23</div>
                <div className="kp-stage">Section 1, Stage 3</div>
              </div>
              <div className="kp-card orange">
                <div className="kp-number">28</div>
                <div className="kp-stage">Section 1, Stage 3</div>
              </div>
              <div className="kp-card green">
                <div className="kp-number">18</div>
                <div className="kp-stage">Section 1, Stage 2</div>
              </div>
              <div className="kp-card blue">
                <div className="kp-number">7</div>
                <div className="kp-stage">Section 1, Stage 1</div>
              </div>
            </div>
          </section>

          {/* Section 2: Educational Videos */}
          <section className="practice-section educational-videos">
            <div className="section-header">
              <div className="section-title-group">
                <h2>Educational Videos</h2>
                <p>Learn new signs with videos</p>
              </div>
              <button className="view-all-btn">
                <img src={viewAllBtnImg} alt="View all" />
              </button>
            </div>

            <div className="video-cards-row">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="video-card">
                  <div className="video-thumbnail">
                    <div className="science-placeholder-art">
                      {/* Using CSS shapes/backgrounds to simulate an illustration */}
                      <div className="science-doodle dna"></div>
                      <div className="science-doodle stars"></div>
                      <div className="science-doodle molecules"></div>
                      <div className="science-text-container">
                        <span className="science-text">SCIENCE</span>
                        <span className="science-sub">PLANETS</span>
                      </div>
                    </div>
                  </div>
                  <div className="video-info">
                    <span className="grade-badge">Grade 1</span>
                    <h3 className="video-title">Different Types of<br/>Planets</h3>
                    <p className="video-desc">Explore the different types of planets in our universe.</p>
                    <div className="video-divider"></div>
                    <div className="video-footer">
                      <svg className="time-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      <span className="time-text">10 min</span>
                    </div>
                  </div>
                </div>
              ))}
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
              Section 1, Unit 1
            </div>

            <div className="timeline-wrapper">
              <div className="timeline-cards">
                {/* Stage 1 */}
                <div className="timeline-card-wrapper completed">
                  <div className="practice-stage-card">
                    <div className="stage-thumbnail">
                      {/* Simulating numbered wooden blocks */}
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
                      <h4>Numbers (0-10)</h4>
                      <p>Learn to count from 0 to 10!</p>
                      <div className="stage-footer">
                        <span className="star-icon">⭐</span>
                        <span>11 pts</span>
                      </div>
                    </div>
                  </div>
                  <div className="timeline-segment segment-green"></div>
                </div>

                {/* Stage 2 */}
                <div className="timeline-card-wrapper completed">
                  <div className="practice-stage-card">
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
                      <h4>Numbers (11 - 20)</h4>
                      <p>Learn to count from 11 to 20!</p>
                      <div className="stage-footer">
                        <span className="star-icon">⭐</span>
                        <span>10 pts</span>
                      </div>
                    </div>
                  </div>
                  <div className="timeline-segment segment-green"></div>
                </div>

                {/* Stage 3 (Active) */}
                <div className="timeline-card-wrapper active">
                  <div className="practice-stage-card border-orange">
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
                      <div className="badge-progress-row">
                        <span className="grade-badge">Grade 1</span>
                        <div className="stage-progress-bar">
                          <div className="stage-progress-fill" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <h4>Numbers (21 - 30)</h4>
                      <p>Learn to count from 21 to 30!</p>
                      <div className="stage-footer">
                        <span className="star-icon">⭐</span>
                        <span>10 pts</span>
                      </div>
                    </div>
                  </div>
                  <div className="timeline-segment segment-gray"></div>
                </div>

                {/* Stage 4 (Locked) */}
                <div className="timeline-card-wrapper locked">
                  <div className="practice-stage-card locked-card">
                    <h4>STAGE</h4>
                    <span className="locked-number">4</span>
                    <span className="lock-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7f8c8d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0110 0v4"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              <button className="next-arrow-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
