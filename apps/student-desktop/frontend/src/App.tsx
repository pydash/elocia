// src/App.tsx
import { useState } from 'react';
import './App.css';
import LessonNavigation from './pages/LessonNavigation';
import CameraSetup from './pages/CameraSetup';
import EvaluationSession from './pages/EvaluationSession';
import Profile from './pages/Profile';

function App() {
  const [currentView, setCurrentView] = useState<'navigation' | 'setup' | 'evaluation' | 'profile'>('navigation');
  const [activeStage, setActiveStage] = useState<number | null>(null);

  // This function handles transitioning from Module 3 to Module 4
  const handleStartLesson = (stageId: number) => {
    setActiveStage(stageId);
    setCurrentView('setup'); // Goes to Camera Setup first
  };

  return (
    <div onClick={(e) => {
      const target = (e.target as HTMLElement).closest('.start-lesson-btn');
      if (target) {
        handleStartLesson(1); // Default to Stage 1 when clicked
      }
    }}>
      {currentView === 'navigation' && (
        <LessonNavigation onNavigate={setCurrentView} />
      )}

      {currentView === 'profile' && (
        <Profile onNavigate={setCurrentView} />
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
          onNavigate={setCurrentView}
        />
      )}
    </div>
  );
}

export default App;