import { useState, useEffect } from 'react';
import './Login.css';
import ProfileSelect from './Profile Select';
import PinEntry from './Student Pin';

export interface StudentProfile {
  id: string;
  name: string;
  color: string;
  emoji: string;
  level?: number;
  streak?: number;
}

interface LoginProps {
  onStart: () => void;
}

export default function Login({ onStart }: LoginProps) {
  const [view, setView] = useState<'welcome' | 'select' | 'pin'>('welcome');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  useEffect(() => {
    // Fetch real students from your backend
    fetch('http://localhost:8000/students')
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error("Failed to load students:", err));
  }, []);

  const handleSelectStudent = (student: StudentProfile) => {
    setSelectedStudent(student);
    setView('pin');
  };

  const handleBack = () => {
    setView('select');
    setSelectedStudent(null);
  };

  const handlePinSuccess = (token: string) => {
    if (selectedStudent) {
      localStorage.setItem('elocia_current_student', JSON.stringify(selectedStudent));
      localStorage.setItem('elocia_access_token', token);
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
      students={students}
      onSelectStudent={handleSelectStudent}
    />
  );
}
