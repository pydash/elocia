import { useState } from 'react';
import type { StudentProfile } from './Login';
import './Student Pin.css';

const studentPinMascot = '/images/Student Pin Monkey.png';

interface PinEntryProps {
  student: StudentProfile;
  onBack: () => void;
  onSuccess: () => void;
}

export default function PinEntry({ student, onBack, onSuccess }: PinEntryProps) {
  const PIN_LENGTH = 4;
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleKeyPress = (digit: string) => {
    if (enteredPin.length >= PIN_LENGTH) return;
    setError(false);

    const newPin = enteredPin + digit;
    setEnteredPin(newPin);

    // Auto-submit when all digits entered
    if (newPin.length === PIN_LENGTH) {
      if (newPin === student.pin) {
        // Correct!
        onSuccess();
      } else {
        // Wrong PIN — shake and reset
        setError(true);
        setShaking(true);
        setTimeout(() => {
          setEnteredPin('');
          setShaking(false);
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    setError(false);
    setEnteredPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="pin-layout">
      {/* Floating background icons */}
      <div className="pin-bg-icons">
        <span className="pin-bg-icon pin-i1">{"\uD83E\uDD1F"}</span>
        <span className="pin-bg-icon pin-i2">{"\u2B50"}</span>
        <span className="pin-bg-icon pin-i3">{"\uD83C\uDFEB"}</span>
        <span className="pin-bg-icon pin-i4">{"\uD83D\uDE0A"}</span>
        <span className="pin-bg-icon pin-i5">{"\uD83D\uDCF7"}</span>
        <span className="pin-bg-icon pin-i6">{"\u270C\uFE0F"}</span>
        <span className="pin-bg-icon pin-i7">{"\u2B50"}</span>
        <span className="pin-bg-icon pin-i8">{"\uD83C\uDFEB"}</span>
        <span className="pin-bg-icon pin-i9">{"\uD83E\uDD1F"}</span>
        <span className="pin-bg-icon pin-i10">{"\uD83D\uDE0A"}</span>
        <span className="pin-bg-icon pin-i11">{"\uD83D\uDCF7"}</span>
        <span className="pin-bg-icon pin-i12">{"\u270C\uFE0F"}</span>
      </div>

      {/* Back button */}
      <button className="pin-back-btn" onClick={onBack} type="button">
        ← Back
      </button>

      {/* Mascot + Speech Bubble */}
      <div className="pin-mascot-area">
        <div className="pin-speech-bubble">
          <p>Hi, {student.name}!<br />Are you ready to learn?</p>
        </div>
        <img src={studentPinMascot} alt="Student Pin Monkey" className="pin-mascot-img" />
      </div>

      {/* PIN Card */}
      <div className="pin-card">
        {/* Student avatar */}
        <div className="pin-avatar" style={{ backgroundColor: student.color }}>
          <span className="pin-avatar-emoji">{student.emoji}</span>
        </div>

        {/* Student name */}
        <h2 className="pin-student-name">{student.name}</h2>

        {/* Instruction */}
        <p className="pin-instruction">Enter your password to start learning!</p>

        {/* PIN Dots */}
        <div className={`pin-dots ${shaking ? 'pin-dots--shake' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`pin-dot ${i < enteredPin.length ? 'pin-dot--filled' : ''} ${error && i < enteredPin.length ? 'pin-dot--error' : ''}`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="pin-error-text">Oops! Try again! 🙈</p>
        )}

        {/* Numeric Keypad */}
        <div className="pin-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              className="pin-key"
              onClick={() => handleKeyPress(String(n))}
              type="button"
            >
              {n}
            </button>
          ))}
          {/* Bottom row: 0 + delete */}
          <div className="pin-key pin-key--spacer" />
          <button
            className="pin-key"
            onClick={() => handleKeyPress('0')}
            type="button"
          >
            0
          </button>
          <button
            className="pin-key pin-key--delete"
            onClick={handleDelete}
            type="button"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
