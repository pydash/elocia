import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import './Help.css';

export default function Help({ onNavigate }: { onNavigate?: (view: 'navigation' | 'setup' | 'evaluation' | 'profile' | 'help' | 'settings') => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function enableCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        if (!cancelled && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Webcam access failed in Help sandbox:', err);
      }
    }
    enableCamera();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="help-page-container">
      {/* Sidebar */}
      <Navbar activeTab="help" onNavigate={onNavigate} />

      {/* Main Content Area */}
      <main className="help-main">
        {/* Background Decorative Pattern */}
        <div className="help-bg-pattern">
          <span className="bg-icon icon-1">{"\u2B50"}</span>
          <span className="bg-icon icon-2">{"\u270C\uFE0F"}</span>
          <span className="bg-icon icon-3">{"\uD83D\uDCF7"}</span>
          <span className="bg-icon icon-4">{"\u2B50"}</span>
          <span className="bg-icon icon-5">{"\uD83E\uDD1F"}</span>
          <span className="bg-icon icon-6">{"\u2699\uFE0F"}</span>
          <span className="bg-icon icon-7">{"\u2B50"}</span>
        </div>

        <div className="help-content-scroll">

          {/* Header Banner */}
          <section className="help-hero-card">
            <h1 className="help-title"> Need Help?</h1>
            <p className="help-subtitle">Find everything you need to know about using Elocia right here!</p>
          </section>

          {/* CAMERA SANDBOX */}
          <section className="help-section">
            <h2 className="section-heading">{"\uD83D\uDCF7"} Check Your Camera</h2>
            <div className="sandbox-container">
              <div className="sandbox-video-wrapper">
                <div className="sandbox-live-badge"><span className="live-dot"></span> LIVE VIDEO</div>
                <video ref={videoRef} autoPlay playsInline muted className="sandbox-video" />
              </div>
              <div className="sandbox-checklist">
                <h3>Before we play, make sure:</h3>
                <ul>
                  <li><span className="check-icon">{"\u2705"}</span> <span><strong>We can see you!</strong> Stay inside the video frame.</span></li>
                  <li><span className="check-icon">{"\u2705"}</span> <span><strong>Not too close.</strong> Leave space for your hands.</span></li>
                  <li><span className="check-icon">{"\u2705"}</span> <span><strong>Lots of light.</strong> Turn on the lights in your room.</span></li>
                  <li><span className="check-icon">{"\u2705"}</span> <span><strong>Clean background.</strong> A blank wall works best!</span></li>
                </ul>
                <div className="sandbox-tip">
                  <strong>Teacher Tip: If your camera is a mirror, raise your right hand and make sure the video does exactly what you do!</strong>
                </div>
              </div>
            </div>
          </section>

          {/* ICON GLOSSARY */}
          <section className="help-section">
            <h2 className="section-heading">What do these buttons do?</h2>
            <div className="help-grid">

              <div className="help-card border-blue">
                <div className="help-icon-circle bg-blue">{"\uD83C\uDF93"}</div>
                <h3>Learn</h3>
                <p>Go here to explore the map and start new sign language lessons.</p>
              </div>

              <div className="help-card border-green">
                <div className="help-icon-circle bg-green">{"\uD83D\uDCDD"}</div>
                <h3>Practice</h3>
                <p>Play fun games to review the signs you already know.</p>
              </div>

              <div className="help-card border-orange">
                <div className="help-icon-circle bg-orange">{"\uD83D\uDC64"}</div>
                <h3>Profile</h3>
                <p>Check your streak, see your stars, and view your achievements.</p>
              </div>

              <div className="help-card border-gray">
                <div className="help-icon-circle bg-gray">{"\u2699\uFE0F"}</div>
                <h3>Settings</h3>
                <p>Change your avatar and access camera shortcuts.</p>
              </div>

              <div className="help-card border-pink">
                <div className="help-icon-circle bg-pink">{"\uD83D\uDC35"}</div>
                <h3>Camera Monkey</h3>
                <p>He'll tell you if you're too close or too far from the camera!</p>
              </div>

              <div className="help-card border-gold">
                <div className="help-icon-circle bg-gold">{"\u2B50"}</div>
                <h3>Stars</h3>
                <p>Earn stars by copying the signs perfectly.</p>
              </div>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}