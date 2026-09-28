import { useState, useEffect } from 'react';
import './ActivityGuideModal.css';

export interface GuideStep {
  title: string;
  desc: string;
  tip: string;
  icon: string;
}

export type ActivityType = 'evaluation' | 'practice' | 'see-it-sign-it' | 'puzzle-sign' | 'magic-fingers';

interface ActivityGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityType: ActivityType;
  activityTitle?: string;
}

const GUIDES: Record<ActivityType, { headerTag: string; steps: GuideStep[] }> = {
  evaluation: {
    headerTag: "HOW TO PLAY",
    steps: [
      {
        title: "Step 1: Look at the Sign! 👀",
        desc: "Look at the number card on the right! That is the sign we will make together!",
        tip: "Get your fingers ready! ✋",
        icon: "👀"
      },
      {
        title: "Step 2: Show Your Hand! 📷",
        desc: "Put your hand in front of the camera so it can see your fingers clearly.",
        tip: "Make sure your room has nice bright lights! ☀️",
        icon: "📷"
      },
      {
        title: "Step 3: Ask for Help! 💡",
        desc: "Need help? Don't worry! We have finger hints and videos to guide you every step.",
        tip: "Making mistakes is how we learn! 🌟",
        icon: "💡"
      },
      {
        title: "Step 4: Press & Win Stars! ⭐",
        desc: "Press the blue 'Check My Sign' button! Hold your hand still. Count 1... 2... 3!",
        tip: "Get all green cards to win and celebrate! 🎉",
        icon: "⭐"
      }
    ]
  },
  practice: {
    headerTag: "PRACTICE TIME",
    steps: [
      {
        title: "Step 1: Pick Any Sign! 🎨",
        desc: "Pick any number or sign you want to practice. There is no rush!",
        tip: "Take your time and have lots of fun! 🎈",
        icon: "🎨"
      },
      {
        title: "Step 2: Watch Your Hand! 📷",
        desc: "Show your hand to the camera! Watch the magic colored dots dance on your fingers.",
        tip: "Move your hand until the dots look happy! 🌈",
        icon: "📷"
      },
      {
        title: "Step 3: Practice Makes Perfect! 🚀",
        desc: "Try as many times as you like! Every sign makes you a sign language superstar!",
        tip: "You are doing great! Keep going! 💖",
        icon: "🚀"
      }
    ]
  },
  'see-it-sign-it': {
    headerTag: "SEE IT, SIGN IT!",
    steps: [
      {
        title: "Step 1: See the Picture! 🔍",
        desc: "Look at the colorful picture on the right! What number or thing is it?",
        tip: "Read the word at the top of your camera! 📖",
        icon: "🔍"
      },
      {
        title: "Step 2: Hand in the Circle! 🎯",
        desc: "Put your hand inside the magic white circle on your screen.",
        tip: "Hold your fingers up high so we can see! 🖐️",
        icon: "🎯"
      },
      {
        title: "Step 3: Freeze and Sign! 🚀",
        desc: "Make the sign and press 'Check My Sign'! Freeze like a statue for 3 seconds!",
        tip: "1... 2... 3... Freeze! 🧊",
        icon: "🚀"
      },
      {
        title: "Step 4: Win Points & Stars! 🏆",
        desc: "Pass the round to earn shiny points and keep your daily streak going!",
        tip: "Can you beat your high score today? 🌟",
        icon: "🏆"
      }
    ]
  },
  'puzzle-sign': {
    headerTag: "PUZZLE SIGN!",
    steps: [
      {
        title: "Step 1: Look at the Puzzle! 🧩",
        desc: "Look at the fun pictures! A number is missing where the '?' is.",
        tip: "For example: 1 Apple + ? = 2 Apples! 🍎",
        icon: "🧩"
      },
      {
        title: "Step 2: Guess the Number! 🧠",
        desc: "Count the things with your eyes! What number completes the puzzle?",
        tip: "Use your fingers to help count! ☝️✌️",
        icon: "🧠"
      },
      {
        title: "Step 3: Show Your Answer! 🤟",
        desc: "Make that number sign with your hand and press 'Check My Sign'!",
        tip: "Hold it still until the computer checks! 📸",
        icon: "🤟"
      },
      {
        title: "Step 4: Clues to Help You! 💡",
        desc: "If you get stuck, a button will appear to show you the answer!",
        tip: "Solving puzzles is super fun! 🎈",
        icon: "💡"
      }
    ]
  },
  'magic-fingers': {
    headerTag: "MAGIC FINGERS!",
    steps: [
      {
        title: "Step 1: Find the Secret Letter! 🔤",
        desc: "Look at the word! One secret letter is hiding in the blank box!",
        tip: "Look at the clue picture on the right to guess! 🐶",
        icon: "🔤"
      },
      {
        title: "Step 2: What Letter Is It? 💡",
        desc: "What letter belongs in the empty box? Say the word out loud!",
        tip: "Listen to the letter sound! 💭",
        icon: "💡"
      },
      {
        title: "Step 3: Sign That Letter! 🖐️",
        desc: "Show that letter with your hand to the camera and press 'Check My Sign'!",
        tip: "Hold your fingers steady for 3 seconds! 📸",
        icon: "🖐️"
      },
      {
        title: "Step 4: Magic Letter Appears! 🎉",
        desc: "When you get it right, the letter pops in like magic! Spell all words to win!",
        tip: "You are a spelling champion! ⭐",
        icon: "🎉"
      }
    ]
  }
};

export default function ActivityGuideModal({
  isOpen,
  onClose,
  activityType,
  activityTitle
}: ActivityGuideModalProps) {
  const [stepIndex, setStepIndex] = useState(0);

  // Reset to first step whenever opened
  useEffect(() => {
    if (isOpen) {
      setStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const guide = GUIDES[activityType] || GUIDES.evaluation;
  const currentStep = guide.steps[stepIndex] || guide.steps[0];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === guide.steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStepIndex(s => s + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      setStepIndex(s => s - 1);
    }
  };

  return (
    <div className="activity-guide-overlay" role="dialog" aria-modal="true">
      <div className="activity-guide-card">
        
        {/* Top Header Tag */}
        <div className="activity-guide-header">
          <div className="activity-guide-tag-wrap">
            <span className="activity-guide-badge">
              {guide.headerTag} • STEP {stepIndex + 1} OF {guide.steps.length}
            </span>
            {activityTitle && (
              <span className="activity-guide-subtext">{activityTitle}</span>
            )}
          </div>
        </div>

        {/* Main Step Content */}
        <div className="activity-guide-body">
          <h2 className="activity-guide-title">
            {currentStep.title}
          </h2>
          <p className="activity-guide-desc">
            {currentStep.desc}
          </p>

          <div className="activity-guide-tip">
            <span className="activity-guide-tip-icon">💡</span>
            <span className="activity-guide-tip-text">{currentStep.tip}</span>
          </div>
        </div>

        {/* Footer Navigation: cannot skip, must go through all steps */}
        <div className="activity-guide-footer">
          <div className="activity-guide-dots">
            {guide.steps.map((_, idx) => (
              <div
                key={idx}
                className={`activity-guide-dot ${idx === stepIndex ? 'active' : ''}`}
                aria-label={`Step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="activity-guide-actions">
            {!isFirst && (
              <button 
                className="activity-guide-back-btn" 
                type="button" 
                onClick={handleBack}
              >
                Back
              </button>
            )}

            <button 
              className={`activity-guide-primary-btn ${isLast ? 'finish' : ''}`} 
              type="button" 
              onClick={handleNext}
            >
              {isLast ? "Let's Play! 🎉" : "Next →"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
