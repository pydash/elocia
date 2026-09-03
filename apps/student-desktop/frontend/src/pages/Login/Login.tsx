import { useState } from 'react';
import './Login.css';
import ProfileSelect from './Profile Select';
import PinEntry from './Student Pin';

export interface StudentProfile {
  id: string;
  name: string;
  pin: string;
  color: string;
  emoji: string;
}

const STUDENTS: StudentProfile[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Ethan', pin: '1234', color: '#F59E0B', emoji: '👦' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Mia', pin: '1234', color: '#EC4899', emoji: '👧' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Leo', pin: '1234', color: '#3B82F6', emoji: '🧒' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Alex', pin: '1234', color: '#10B981', emoji: '👦' },
];

interface LoginProps {
  onStart: () => void;
}

export default function Login({ onStart }: LoginProps) {
  const [view, setView] = useState<'welcome' | 'select' | 'pin'>('welcome');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  const handleSelectStudent = (student: StudentProfile) => {
    setSelectedStudent(student);
    setView('pin');
  };

  const handleBack = () => {
    setView('select');
    setSelectedStudent(null);
  };

  const handlePinSuccess = () => {
    if (selectedStudent) {
      localStorage.setItem('elocia_current_student', JSON.stringify(selectedStudent));
    }
    onStart();
  };

  if (view === 'welcome') {
    return (
      <div className="login-welcome-screen">
        <div className="login-welcome-content">
          <div className="login-logo-badge">
            <img src="/images/logo-icon.png" alt="ELOCIA logo" className="login-logo-image" />
          </div>

          <h1 className="login-welcome-title">Welcome Back!</h1>

          <p className="login-welcome-subtitle">
            Dive back into your learning adventure with ELOCIA.
            <br />
            Exciting new challenges await!
          </p>

          <button type="button" className="login-start-btn" onClick={() => setView('select')}>
            START
          </button>
        </div>
      </div>
    );
  }

  if (view === 'pin' && selectedStudent) {
    return (
      <PinEntry
        student={selectedStudent}
        onBack={handleBack}
        onSuccess={handlePinSuccess}
      />
    );
  }

  return (
    <ProfileSelect
      students={STUDENTS}
      onSelectStudent={handleSelectStudent}
    />
  );
}
