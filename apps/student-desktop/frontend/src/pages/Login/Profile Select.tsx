import { useState } from 'react';
import type { StudentProfile } from './Login';
import './Profile Select.css';

const logoImg = '/images/logo-icon.png';

interface ProfileSelectProps {
  students: StudentProfile[];
  onSelectStudent: (student: StudentProfile) => void;
}

export default function ProfileSelect({ students, onSelectStudent }: ProfileSelectProps) {
  // Option 1: 5 students per page in a clean, single row
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(students.length / PAGE_SIZE) || 1;
  const startIndex = currentPage * PAGE_SIZE;
  const visibleStudents = students.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePrev = () => {
    setCurrentPage(p => Math.max(0, p - 1));
  };

  const handleNext = () => {
    setCurrentPage(p => Math.min(totalPages - 1, p + 1));
  };

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

        {/* Profile Carousel Row */}
        <div className="ps-carousel-wrapper">
          {totalPages > 1 && (
            <button
              className="ps-nav-arrow ps-prev-arrow"
              onClick={handlePrev}
              disabled={currentPage === 0}
              type="button"
              aria-label="Previous Page"
            >
              {"\u25C0"}
            </button>
          )}

          <div className="ps-grid">
            {visibleStudents.map((student) => (
              <button
                key={student.id}
                className="ps-card"
                onClick={() => onSelectStudent(student)}
                type="button"
              >
                <div className="ps-avatar" style={{ backgroundColor: student.color, overflow: 'hidden' }}>
                  {student.emoji && (student.emoji.startsWith('data:') || student.emoji.startsWith('http') || student.emoji.startsWith('/')) ? (
                    <img src={student.emoji} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <span className="ps-avatar-emoji">{student.emoji || "\uD83D\uDC66"}</span>
                  )}
                </div>
                <span className="ps-name">{student.name}</span>
                <span className="ps-code-badge">{student.student_code || `G${student.grade_level || 1}-01`}</span>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <button
              className="ps-nav-arrow ps-next-arrow"
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              type="button"
              aria-label="Next Page"
            >
              {"\u25B6"}
            </button>
          )}
        </div>

        {/* Page Dots Indicator */}
        {totalPages > 1 && (
          <div className="ps-pagination-dots">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`ps-dot ${i === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(i)}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
