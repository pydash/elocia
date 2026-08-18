import { useRef, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './CameraSetup.css';

import sunImg from '../assets/images/Sun.png';
import cloud1Img from '../assets/images/Cloud 1.png';
import cloud2Img from '../assets/images/Cloud 2.png';
import cloud3Img from '../assets/images/Cloud 3.png';
import cloud5Img from '../assets/images/Cloud 5.png';
import cloud6Img from '../assets/images/Cloud 6.png';
import setupDialogueBubble from '../assets/images/setup dialogue.png';
import setupMonkeyAsset from '../assets/images/Tier 4 Pass-and-Flag.png';

interface CameraSetupProps {
  onDone: () => void;
  onCancel: () => void;
}

export default function CameraSetup({ onDone, onCancel }: CameraSetupProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [step, setStep] = useState<'setup' | 'smile' | 'too-far' | 'too-close' | 'perfect'>('setup');

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (step !== 'setup') {
      async function enableCamera() {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access failed:", err);
        }
      }
      enableCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  const handleNext = () => {
    if (step === 'setup') setStep('smile');
    else if (step === 'perfect') onDone();
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content-area">
        
        {/* Background Clouds */}
        <div className="clouds-wrapper">
          <img src={sunImg} alt="Sun" className="bg-decor sun" />
          <img src={cloud1Img} alt="Cloud 1" className="bg-decor cloud-1" />
          <img src={cloud2Img} alt="Cloud 2" className="bg-decor cloud-2" />
          <img src={cloud3Img} alt="Cloud 3" className="bg-decor cloud-3" />
          <img src={cloud5Img} alt="Cloud 5" className="bg-decor cloud-5" />
          <img src={cloud6Img} alt="Cloud 6" className="bg-decor cloud-6" />
        </div>

        {/* STEP 1: INITIAL SETUP VIEW */}
        {step === 'setup' && (
          <div className="camera-setup-content-wrapper">
            <div className="tips-card-box-large">
              <h3>Tips for a perfect shot!</h3>
              <ul>
                <li><span style={{ color: '#FF662E' }}>●</span> Sit up straight</li>
                <li><span style={{ color: '#2EABFF' }}>●</span> Find a bright place</li>
                <li><span style={{ color: '#6DD62C' }}>●</span> Keep smiling</li>
              </ul>
            </div>
            <div className="setup-mascot-container-large">
              <img src={setupDialogueBubble} alt="Setup Dialogue" className="setup-speech-bubble-large" />
              <img src={setupMonkeyAsset} alt="Setup Monkey" className="setup-monkey-img-large" />
            </div>
          </div>
        )}

        {/* STEPS 2-5: CAMERA CHECK VIEWS (Smile, Too Far, Too Close, Perfect) */}
        {step !== 'setup' && (
          <div className="camera-setup-content-wrapper">
            <div className="camera-check-group">
              
              {/* Dynamic Mascot Dialogue */}
              <div className="check-mascot-container">
                <div className="speech-bubble-check">
                  {step === 'smile' && 'Position your face in the circle & smile!'}
                  {step === 'too-far' && 'Oops! You are too far from the camera!'}
                  {step === 'too-close' && 'Oops! You are too close to the camera!'}
                  {step === 'perfect' && 'Perfect! You are now ready to start!'}
                </div>
                <img src={setupMonkeyAsset} alt="Mascot Monkey" className="check-monkey-img" />
              </div>

              {/* Continuous Video Feed with Dynamic Warnings */}
              <div className="live-camera-feed-card">
                {step === 'too-far' && <div className="top-warning-tag">Try moving closer to the camera</div>}
                {step === 'too-close' && <div className="top-warning-tag">Try moving away from the camera</div>}
                {step === 'perfect' && <div className="top-warning-tag">Perfect! Click "Start" to begin! Good luck!</div>}
                
                <div className="live-badge-tag">● LIVE FEED</div>
                <video ref={videoRef} autoPlay playsInline muted className="actual-webcam-stream" />
                <div className="crosshair-guide"></div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Split Navigation */}
        <div className="bottom-split-nav-bar">
          <button className="split-btn back-btn-side" onClick={onCancel}>
            <span>⬅</span> Back
          </button>

          <button 
            className="split-btn okay-btn-side" 
            onClick={handleNext}
            style={{ 
              opacity: (step === 'setup' || step === 'perfect') ? 1 : 0.5, 
              pointerEvents: (step === 'setup' || step === 'perfect') ? 'auto' : 'none' 
            }}
          >
            {step === 'setup' ? 'Okay' : 'Start'} <span>➡</span>
          </button>
        </div>
      </div>
    </div>
  );
}