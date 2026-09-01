import { useState, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Settings.css';

type View = 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings';

const PRESET_AVATARS = ['\uD83D\uDC31', '\uD83D\uDC36', '\uD83E\uDD8A', '\uD83D\uDC3C', '\uD83D\uDC38', '\uD83E\uDD81', '\uD83D\uDC2F', '\uD83D\uDC28'];

const getStoredAvatar = (): string => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return '';
  }

  return window.localStorage.getItem('elocia_avatar') || '';
};

export default function Settings({ onNavigate }: { onNavigate?: (view: View) => void }) {
  // ── Avatar state ──────────────────────────────────────────────────────────
  const [savedAvatar, setSavedAvatar] = useState<string>(getStoredAvatar);
  const [pendingAvatar, setPendingAvatar] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty = pendingAvatar !== '' && pendingAvatar !== savedAvatar;

  function selectEmoji(emoji: string) {
    setPendingAvatar(emoji);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPendingAvatar(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function saveAvatar() {
    if (!pendingAvatar) return;

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('elocia_avatar', pendingAvatar);
    }

    setSavedAvatar(pendingAvatar);
    setPendingAvatar('');
  }

  const displayAvatar = pendingAvatar || savedAvatar;

  return (
    <div className="settings-page-container">
      <Sidebar activeTab="settings" onNavigate={onNavigate} />

      <main className="settings-main">
        {/* Background Decorative Pattern */}
        <div className="settings-bg-pattern">
          <span className="bg-icon icon-1">{"\u2699\uFE0F"}</span>
          <span className="bg-icon icon-2">{"\uD83C\uDF1F"}</span>
          <span className="bg-icon icon-3">{"\uD83C\uDFA8"}</span>
          <span className="bg-icon icon-4">{"\u2699\uFE0F"}</span>
          <span className="bg-icon icon-5">{"\u2728"}</span>
          <span className="bg-icon icon-6">{"\uD83C\uDFAF"}</span>
          <span className="bg-icon icon-7">{"\u2699\uFE0F"}</span>
        </div>

        <div className="settings-content-scroll">

          {/* Hero Banner */}
          <section className="settings-hero-card">
            <h1 className="settings-title">My Settings</h1>
            <p className="settings-subtitle">Make Elocia feel just right for you!</p>
          </section>

          {/* ── Camera ──────────────────────────────────────────────────── */}
          <section className="settings-section">
            <h2 className="settings-section-heading">{"\uD83D\uDCF7"} Camera</h2>
            <div className="settings-card camera-card">
              <div className="camera-card-body">
                <span className="camera-emoji">{"\uD83D\uDCF9"}</span>
                <div className="camera-text">
                  <h3>Need help with your camera?</h3>
                  <p>Go to the Help page to check your camera and get tips on the best position!</p>
                </div>
              </div>
              <button
                className="go-to-help-btn"
                onClick={() => onNavigate?.('help')}
              >
                Go to Help →
              </button>
            </div>
          </section>

          {/* ── Avatar ──────────────────────────────────────────────────── */}
          <section className="settings-section">
            <h2 className="settings-section-heading">{"\uD83D\uDDBC\uFE0F"} Choose Your Avatar</h2>
            <div className="settings-card avatar-card">

              {/* Current avatar preview */}
              <div className="avatar-preview-area">
                <div className="avatar-preview-circle">
                  {displayAvatar.startsWith('data:') ? (
                    <img src={displayAvatar} alt="Your avatar" className="avatar-preview-img" />
                  ) : (
                    <span className="avatar-preview-emoji">{displayAvatar || "\uD83D\uDE0A"}</span>
                  )}
                </div>
                <p className="avatar-preview-label">
                  {isDirty ? '👆 Tap Save to apply!' : 'Your current avatar'}
                </p>
              </div>

              {/* Emoji grid */}
              <div className="avatar-emoji-grid">
                {PRESET_AVATARS.map(emoji => (
                  <button
                    key={emoji}
                    className={`avatar-emoji-btn ${(pendingAvatar || savedAvatar) === emoji ? 'selected' : ''}`}
                    onClick={() => selectEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}

                {/* Upload button */}
                <button
                  className="avatar-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {"\uD83D\uDCF7"}<span>Upload Photo</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* Save button — only shown when there's an unsaved change */}
              {isDirty && (
                <button className="save-avatar-btn" onClick={saveAvatar}>
                  {"\u2705"} Save Avatar
                </button>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
