import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

let currentDriverInstance: ReturnType<typeof driver> | null = null;
let currentTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Safely stops and completely removes any active driver.js instance and DOM artifacts.
 */
export function stopCurrentTour() {
  if (currentTimer) {
    clearTimeout(currentTimer);
    currentTimer = null;
  }
  if (currentDriverInstance) {
    try {
      currentDriverInstance.destroy();
    } catch {
      // ignore
    }
    currentDriverInstance = null;
  }

  // Hard cleanup to ensure no orphaned popover or overlay remains in the DOM
  document.querySelectorAll('.driver-popover, .driver-overlay, svg.driver-overlay').forEach(el => el.remove());
  document.body.classList.remove('driver-active', 'driver-fade', 'driver-no-scroll');
  document.querySelectorAll('.driver-active-element').forEach(el => el.classList.remove('driver-active-element'));
}

/**
 * Common configuration factory for Elocia Activity Tours
 * Simple, playful English for Grade 1 - 3 learners.
 */
function createElociaDriver(steps: DriveStep[], onDone?: () => void) {
  stopCurrentTour();

  currentDriverInstance = driver({
    showProgress: true,
    animate: true,
    smoothScroll: false,
    allowScroll: false,
    overlayOpacity: 0.72,
    stagePadding: 8,
    stageRadius: 16,
    popoverClass: 'elocia-driver-theme',
    nextBtnText: 'Next ➔',
    prevBtnText: 'Back',
    doneBtnText: "I'm Ready! 🎉",
    progressText: '{{current}} of {{total}}',
    steps,
    onDestroyed: () => {
      stopCurrentTour();
      if (onDone) onDone();
    }
  });

  return currentDriverInstance;
}

/**
 * 1. Learn & Evaluation Session Tour (Stage 1-5, Practice & Evaluation)
 * Playful small English for Grade 1 - 3.
 */
export function startEvaluationTour() {
  const steps: DriveStep[] = [
    {
      element: '.eval-instruction-card',
      popover: {
        title: '🎯 Make the Sign!',
        description: 'Read the word and make the sign! ✨',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.eval-number-card',
      popover: {
        title: '🔢 Target Sign',
        description: 'Copy this sign! Look closely! 👀',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '.eval-camera-wrapper',
      popover: {
        title: '📷 Camera Magic!',
        description: 'Show your hand to the camera! ✋',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '.eval-mascot-feedback-card',
      popover: {
        title: '🐵 Need Help?',
        description: 'Watch Teacher demo video here! 🎬',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '.eval-parameters-grid',
      popover: {
        title: '⭐ Your Star Scores!',
        description: 'Collect your shiny stars here! 🌟',
        side: 'top',
        align: 'center'
      }
    }
  ];

  const driverObj = createElociaDriver(steps);

  currentTimer = setTimeout(() => {
    currentTimer = null;
    driverObj.drive();
  }, 300);
}

/**
 * 2. See It, Sign It! Mini-Game Tour
 * Playful small English for Grade 1 - 3.
 */
export function startSeeItSignItTour() {
  const steps: DriveStep[] = [
    {
      element: '.eval-instruction-card',
      popover: {
        title: '🏷️ Sign the Word!',
        description: 'Look at the target word and sign it! 🚀',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.sisi-image-card-container',
      popover: {
        title: '🖼️ Picture Clue',
        description: 'Look at the picture clue to know what to sign! 🔍',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '.eval-camera-wrapper',
      popover: {
        title: '📷 Camera Magic!',
        description: 'Show your hand to the camera! The game evaluates automatically! ✋',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '.sisi-score-card',
      popover: {
        title: '🔥 Your High Score!',
        description: 'Keep your streak alive to get a huge score multiplier! 🏆',
        side: 'left',
        align: 'center'
      }
    }
  ];

  const driverObj = createElociaDriver(steps);

  currentTimer = setTimeout(() => {
    currentTimer = null;
    driverObj.drive();
  }, 300);
}

/**
 * 3. Puzzle Sign Mini-Game Tour
 * Playful small English for Grade 1 - 3.
 */
export function startPuzzleSignTour() {
  const steps: DriveStep[] = [
    {
      element: '.eval-instruction-card',
      popover: {
        title: '🧩 Puzzle Clue',
        description: 'Read the equation and clue to solve the puzzle! 💡',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.ps-puzzle-card',
      popover: {
        title: '➕ What is Missing?',
        description: 'Guess the mystery sign at the "?" mark! ❓',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '.eval-camera-wrapper',
      popover: {
        title: '📷 Sign Your Answer!',
        description: 'Show your answer to the camera! Auto-grading checks your sign! ✋',
        side: 'right',
        align: 'center'
      }
    }
  ];

  const driverObj = createElociaDriver(steps);

  currentTimer = setTimeout(() => {
    currentTimer = null;
    driverObj.drive();
  }, 300);
}

/**
 * 4. Magic Fingers Mini-Game Tour
 * Playful small English for Grade 1 - 3.
 */
export function startMagicFingersTour() {
  const steps: DriveStep[] = [
    {
      element: '.eval-instruction-card',
      popover: {
        title: '🔤 Missing Letter Slot',
        description: 'A letter is missing from the word! Look at the arrow indicator! 🔍',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.sisi-image-card-container',
      popover: {
        title: '🖼️ Word Clue Picture',
        description: 'Use the picture to figure out what word it is! 💡',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '.eval-camera-wrapper',
      popover: {
        title: '📷 Sign the Missing Letter!',
        description: 'Make the missing alphabet letter sign with your hand! ✋',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '.mf-score-card',
      popover: {
        title: '🏆 Star Points & Streak',
        description: 'Earn points and build your streak bonus! 🌟',
        side: 'left',
        align: 'center'
      }
    }
  ];

  const driverObj = createElociaDriver(steps);

  currentTimer = setTimeout(() => {
    currentTimer = null;
    driverObj.drive();
  }, 300);
}
