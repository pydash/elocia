import React, { useState } from 'react';
import Navbar from '../components/Navbar'; 
import './LessonNavigation.css'; 

// Mock Data
const MOCK_SECTIONS = [
  { id: 1, title: 'Basic Greetings' },
  { id: 2, title: 'Numbers' },
  { id: 3, title: 'Family Members' },
  { id: 4, title: 'Colors' },
];

const MOCK_STAGES = {
  2: [
    { id: 1, title: 'Stage 1', status: 'completed' },
    { id: 2, title: 'Stage 2', status: 'completed' },
    { 
      id: 3, 
      title: 'Stage 3', 
      subtitle: 'Master Intermediate Numbers (21 - 30)',
      description: 'Learn the signs for numbers from 21 to 30 through guided lessons, examples, and practice activities.',
      status: 'active' 
    },
    { id: 4, title: 'Stage 4', status: 'locked' },
  ]
};

// THIS IS THE FIX: "export default" is right here!
export default function LessonNavigation() {
  const [activeSectionId, setActiveSectionId] = useState<number>(2); 
  const [selectedStage, setSelectedStage] = useState<any | null>(null); 

  return (
    <div className="app-layout">
      {/* 1. LEFT SIDEBAR */}
      <Navbar /> 

      {/* 2. MAIN CONTENT (Pushed to the right of the sidebar) */}
      <div className="main-content-area" style={{ marginLeft: '220px', padding: '20px' }}>
        
        {/* Top bar for sections (Basic Greetings, Numbers, etc.) */}
        <header className="sections-header">
          {MOCK_SECTIONS.map((section) => (
            <button 
              key={section.id}
              className={`section-tab ${activeSectionId === section.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSectionId(section.id);
                setSelectedStage(null); 
              }}
            >
              {section.title}
            </button>
          ))}
          <div className="stars-container">⭐ 5</div>
        </header>

        {/* The rest of the map and details panel will go here next! */}
        <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
            <h2>Winding Map Path will go here...</h2>
        </div>
        
      </div>
    </div>
  );
}