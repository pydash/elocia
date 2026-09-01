<<<<<<< HEAD
import './App.css'
import LessonNavigation from './pages/Lessons/Lessons'; // Added /pages/
=======
// src/App.tsx
import { useState } from 'react';
import './App.css';
import Login from './pages/Login/Login';
import LessonNavigation from './pages/Lessons/LessonNavigation';
import CameraSetup from './pages/Setup/CameraSetup';
import EvaluationSession from './pages/Evaluation/EvaluationSession';
import StageComplete from './pages/StageComplete/StageComplete';
import Profile from './pages/Profile/Profile';
import Help from './pages/Help/Help';
import Settings from './pages/Settings/Settings';
import Achievements from './pages/Achievements/Achievements';
import Practice from './pages/Practice/Practice';
import PuzzleSign from './pages/Mini Games/Puzzle Sign';

import SeeItSignIt from './pages/Mini Games/SeeItSignIt';
import MagicFingers from './pages/Mini Games/MagicFingers';
>>>>>>> 760f75e03194bc04076708af8826962e2e8fd3c6

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'navigation' | 'setup' | 'evaluation' | 'stageComplete' | 'profile' | 'help' | 'settings' | 'achievements' | 'practice' | 'puzzle-sign' | 'see-it-sign-it' | 'magic-fingers'>('login');
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [completedStage, setCompletedStage] = useState<number | null>(null);
  const [unlockedStages, setUnlockedStages] = useState<number[]>([1]); // Stage 1 is unlocked by default

  // This function handles transitioning from Module 3 to Module 4
  const handleStartLesson = (stageId: number) => {
    setActiveStage(stageId);
    setCurrentView('setup'); // Goes to Camera Setup first
  };

  return (
    <div onClick={(e) => {
      const el = e.target as HTMLElement;
      // Logout button (sidebar, available on every page) -> back to Login
      if (el.closest('.nav-logout-btn')) {
        setCurrentView('login');
        return;
      }
      const target = el.closest('.start-lesson-btn');
      if (target) {
        // Find which stage was selected in LessonNavigation and start it
        // We will manage this directly from inside LessonNavigation instead of event delegation
      }
    }}>
      {currentView === 'login' && (
        <Login onStart={() => setCurrentView('navigation')} />
      )}

      {currentView === 'navigation' && (
        <LessonNavigation 
          onNavigate={setCurrentView} 
          unlockedStages={unlockedStages} 
          onStartLesson={handleStartLesson} 
        />
      )}

      {currentView === 'practice' && (
        <Practice onNavigate={setCurrentView} />
      )}

      {currentView === 'puzzle-sign' && (
        <PuzzleSign onNavigate={setCurrentView} />
      )}

      {currentView === 'see-it-sign-it' && (
        <SeeItSignIt onNavigate={setCurrentView} />
      )}

      {currentView === 'magic-fingers' && (
        <MagicFingers onNavigate={setCurrentView} />
      )}

      {currentView === 'profile' && (
        <Profile onNavigate={setCurrentView} />
      )}

      {currentView === 'achievements' && (
        <Achievements onNavigate={setCurrentView} />
      )}

      {currentView === 'help' && (
        <Help onNavigate={setCurrentView} />
      )}

      {currentView === 'settings' && (
        <Settings onNavigate={setCurrentView} />
      )}

      {currentView === 'setup' && (
        <CameraSetup
          onDone={() => setCurrentView('evaluation')}
          onCancel={() => setCurrentView('navigation')}
        />
      )}

      {currentView === 'evaluation' && (
        <EvaluationSession
          stageId={activeStage}
          onExit={() => setCurrentView('navigation')}
          onComplete={(completedStageId) => {
            // Unlock next stage if it exists
            const nextStageId = completedStageId + 1;
            setUnlockedStages(prev => prev.includes(nextStageId) ? prev : [...prev, nextStageId]);
            // Celebrate with the Stage Complete milestone screen
            setCompletedStage(completedStageId);
            setCurrentView('stageComplete');
          }}
          onNavigate={setCurrentView}
        />
      )}

      {currentView === 'stageComplete' && (
        <StageComplete
          stageId={completedStage}
          onBackToLearn={() => setCurrentView('navigation')}
          onNavigate={setCurrentView}
        />
      )}
    </div>
  );
}

export default App;