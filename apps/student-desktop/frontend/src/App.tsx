// src/App.tsx
import { useState } from 'react';
import './App.css';
import LessonNavigation from './pages/LessonNavigation';
import CameraSetup from './pages/CameraSetup';
import EvaluationSession from './pages/EvaluationSession';

function App() {
  const [currentView, setCurrentView] = useState<'navigation' | 'setup' | 'evaluation'>('navigation');
  const [activeStage, setActiveStage] = useState<number | null>(null);

  // This function handles transitioning from Module 3 to Module 4
  const handleStartLesson = (stageId: number) => {
    setActiveStage(stageId);
    setCurrentView('setup'); // Goes to Camera Setup first
  };

  return (
    <>
      {currentView === 'navigation' && (
        // If you don't want to change their file, you can wrap a container around it 
        // or add a global click listener on document for buttons with class 'start-lesson-btn'
        <div onClick={(e) => {
          const target = (e.target as HTMLElement).closest('.start-lesson-btn');
          if (target) {
            handleStartLesson(1); // Default to Stage 1 when clicked
          }
        }}>
          <LessonNavigation />
        </div>
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
        />
      )}
    </>
  );
}

export default App;