import { useRef, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import './CameraSetup.css';

import sunImg from '../assets/images/Sun.png';
import cloud1Img from '../assets/images/Cloud 1.png';
import cloud2Img from '../assets/images/Cloud 2.png';
import cloud3Img from '../assets/images/Cloud 3.png';
import cloud5Img from '../assets/images/Cloud 5.png';
import cloud6Img from '../assets/images/Cloud 6.png';
import grassImg from '../assets/images/Grass.png';

import setupDialogueBubble from '../assets/images/setup dialogue.png';
import tooFarDialogueBubble from '../assets/images/too far dialogue.png';
import tooCloseDialogueBubble from '../assets/images/too close dialogue.png';
import perfectDialogueBubble from '../assets/images/perfect dialogue.png';

import preparingMonkey from '../assets/images/preparing camera.png';
import moveAwayMonkey from '../assets/images/Move away.png';
import moveCloserMonkey from '../assets/images/Move closer.png';
import perfectMonkey from '../assets/images/Perfect range camera.png';

interface CameraSetupProps {
  onDone: () => void;
  onCancel: () => void;
}

type SetupStep = 'setup' | 'not-detected' | 'too-close' | 'too-far' | 'perfect';

export default function CameraSetup({ onDone, onCancel }: CameraSetupProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));

  const [step, setStep] = useState<SetupStep>('setup');

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (step !== 'setup') {
      async function enableCamera() {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Webcam access failed:', err);
        }
      }
      enableCamera();
    }

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [step]);

  useEffect(() => {
    if (step === 'setup') return;

    const ws = new WebSocket('ws://127.0.0.1:8000/ws/camera-check');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status) {
          setStep(data.status as SetupStep);
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    const interval = setInterval(() => {
      if (
        ws.readyState === WebSocket.OPEN &&
        videoRef.current &&
        videoRef.current.videoWidth > 0
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64Data = canvas.toDataURL('image/jpeg', 0.5);
          
          ws.send(JSON.stringify({ image: base64Data }));
        }
      }
    }, 140);

    return () => {
      clearInterval(interval);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [step]);

  const getDialogueBubble = () => {
    switch (step) {
      case 'not-detected': return tooFarDialogueBubble;
      case 'too-close':    return tooCloseDialogueBubble;
      case 'too-far':      return tooFarDialogueBubble;
      case 'perfect':      return perfectDialogueBubble;
      default:             return setupDialogueBubble;
    }
  };

  const getMascot = () => {
    switch (step) {
      case 'not-detected': return moveCloserMonkey;
      case 'too-close':    return moveAwayMonkey;
      case 'too-far':      return moveCloserMonkey;
      case 'perfect':      return perfectMonkey;
      default:             return preparingMonkey;
    }
  };

  const isNextActive = step === 'setup' || step === 'perfect';

  return (
    <div className="app-layout">
      <Navbar />
      <div className="main-content-area">

        <div className="clouds-wrapper">
          <img src={sunImg} alt="" className="bg-decor sun" />
          <img src={cloud1Img} alt="" className="bg-decor cloud-1" />
          <img src={cloud2Img} alt="" className="bg-decor cloud-2" />
          <img src={cloud3Img} alt="" className="bg-decor cloud-3" />
          <img src={cloud5Img} alt="" className="bg-decor cloud-5" />
          <img src={cloud6Img} alt="" className="bg-decor cloud-6" />
        </div>

        <img src={grassImg} alt="" className="grass-strip" />

        <div className="camera-setup-content-wrapper">
          {step === 'setup' ? (
            <div className="tips-card-box-large">
              <h3>Tips for a perfect shot!</h3>
              <ul>
                <li><span style={{ color: '#FF662E' }}>●</span> Sit up straight</li>
                <li><span style={{ color: '#2EABFF' }}>●</span> Find a bright place</li>
                
                <li><span style={{ color: '#6DD62C' }}>●</span> Show head to half-body</li>
              </ul>
            </div>
          ) : (
            <div className="live-camera-feed-card">
              
              {step === 'not-detected' && (
                <div className="top-warning-tag">Please step in front of the camera!</div>
              )}
              {step === 'too-close' && (
                <div className="top-warning-tag">Move away: Make sure your shoulders fit in frame</div>
              )}
              {step === 'too-far' && (
                <div className="top-warning-tag">Move closer to the camera</div>
              )}
              {step === 'perfect' && (
                <div className="top-warning-tag tag-perfect">
                  ● Half-Body Framing Perfect! Click "Start" to begin!
                </div>
              )}
              <div className="live-badge-tag">● LIVE FEED</div>
              <video ref={videoRef} autoPlay playsInline muted className="actual-webcam-stream" />
              <div className="crosshair-guide" />
            </div>
          )}
        </div>

        <div className={`stage-mascot-column mascot-step-${step}`}>
          <img
            src={getDialogueBubble()}
            alt=""
            className={`stage-speech-bubble bubble-step-${step}`}
          />
          <img
            src={getMascot()}
            alt=""
            className={`stage-monkey-img monkey-step-${step}`}
          />
        </div>

        <div className="bottom-split-nav-bar">
          <button className="split-btn back-btn-side" onClick={onCancel}>
            <span>⬅</span> Back
          </button>
          <button
            className={`split-btn okay-btn-side ${isNextActive ? 'active-green' : 'disabled-state'}`}
            onClick={() => {
              if (step === 'setup') setStep('not-detected'); 
              else if (step === 'perfect') onDone(); 
            }}
            disabled={!isNextActive}
          >
            {step === 'setup' ? 'Okay' : 'Start'} <span>➡</span>
          </button>
        </div>

      </div>
    </div>
  );
}