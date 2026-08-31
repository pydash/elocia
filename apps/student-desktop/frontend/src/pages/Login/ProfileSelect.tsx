import type { StudentProfile } from './Login';
import './Profile Select.css';

const logoImg = '/images/logo-icon.png';

interface ProfileSelectProps {
  students: StudentProfile[];
  onSelectStudent: (student: StudentProfile) => void;
}

export default function ProfileSelect({ students, onSelectStudent }: ProfileSelectProps) {
  return (
    <div className="ps-layout">
      {/* Floating background icons */}
      <div className="ps-bg-icons">
        <span className="ps-bg-icon ps-i1">{"\uD83E\uDD1F"}</span>
        <span className="ps-bg-icon ps-i2">{"\u2B50"}</span>
        <span className="ps-bg-icon ps-i3">{"\uD83C\uDFEB"}</span>
        <span className="ps-bg-icon ps-i4">{"\uD83D\uDE0A"}</span>
        <span className="ps-bg-icon ps-i5">{"\uD83D\uDCF7"}</span>
        <span className="ps-bg-icon ps-i6">{"\u270C\uFE0F"}</span>
        <span className="ps-bg-icon ps-i7">{"\u2B50"}</span>
        <span className="ps-bg-icon ps-i8">{"\uD83C\uDFEB"}</span>
        <span className="ps-bg-icon ps-i9">{"\uD83E\uDD1F"}</span>
        <span className="ps-bg-icon ps-i10">{"\uD83D\uDE0A"}</span>
        <span className="ps-bg-icon ps-i11">{"\uD83D\uDCF7"}</span>
        <span className="ps-bg-icon ps-i12">{"\u270C\uFE0F"}</span>
        <span className="ps-bg-icon ps-i13">{"\u2B50"}</span>
        <span className="ps-bg-icon ps-i14">{"\uD83E\uDDE9"}</span>
      </div>

      <div className="ps-content">
        {/* Logo */}
        <div className="ps-logo-card">
          <img src={logoImg} alt="ELOCIA" className="ps-logo-img" />
        </div>

        {/* Heading */}
        <h1 className="ps-heading">Who's playing?</h1>
        <p className="ps-subtext">Tap your picture to start learning!</p>

        {/* Profile Grid */}
        <div className="ps-grid">
          {students.map((student) => (
            <button
              key={student.id}
              className="ps-card"
              onClick={() => onSelectStudent(student)}
              type="button"
            >
              <div className="ps-avatar" style={{ backgroundColor: student.color }}>
                <span className="ps-avatar-emoji">{student.emoji}</span>
              </div>
              <span className="ps-name">{student.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

