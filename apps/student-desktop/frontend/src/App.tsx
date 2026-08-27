// src/App.tsx
import { useState } from 'react';
import './App.css';
import LessonNavigation from './pages/Lessons/LessonNavigation';
import CameraSetup from './pages/Setup/CameraSetup';
import EvaluationSession from './pages/Evaluation/EvaluationSession';
import StageComplete from './pages/StageComplete/StageComplete';
import Profile from './pages/Profile/Profile';
import Help from './pages/Help/Help';
import Settings from './pages/Settings/Settings';
import Achievements from './pages/Achievements/Achievements';

function App() {
  const [currentView, setCurrentView] = useState<'navigation' | 'setup' | 'evaluation' | 'stageComplete' | 'profile' | 'help' | 'settings' | 'achievements'>('navigation');
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
      const target = (e.target as HTMLElement).closest('.start-lesson-btn');
      if (target) {
        // Find which stage was selected in LessonNavigation and start it
        // We will manage this directly from inside LessonNavigation instead of event delegation
      }
    }}>
      {currentView === 'navigation' && (
        <LessonNavigation 
          onNavigate={setCurrentView} 
          unlockedStages={unlockedStages} 
          onStartLesson={handleStartLesson} 
        />
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