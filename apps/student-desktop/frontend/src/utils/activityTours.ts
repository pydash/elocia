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
 * Simple Taglish, visual-first for Grade 1 - 3 SPED learners.
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
    nextBtnText: 'Susunod ➔',
    prevBtnText: 'Bumalik',
    doneBtnText: 'Handa na Ako! 🎉',
    progressText: '{{current}} ng {{total}}',
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
 * Simple Taglish, short 3-5 word descriptions.
 */
export function startEvaluationTour() {
  const steps: DriveStep[] = [
    {
      element: '.eval-instruction-card',
      popover: {
        title: '🎯 Gawin ang Sign!',
        description: 'I-sign mo ang nakasulat dito!',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.eval-number-card',
      popover: {
        title: '🔢 Target Sign',
        description: 'Ito ang gagayahin mo! Tingnan mabuti. 👀',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '.eval-camera-wrapper',
      popover: {
        title: '📷 Ikaw Ito!',
        description: 'Ipakita ang iyong kamay dito sa gitna! ✋',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '.eval-mascot-feedback-card',
      popover: {
        title: '🐵 Kailangan ng Tulong?',
        description: 'Panoorin ang video demo ni Teacher dito! 🎬',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '.eval-parameters-grid',
      popover: {
        title: '⭐ Iyong Grades!',
        description: 'Dito lalabas ang iyong grades at stars! 🌟',
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
 * Simple Taglish, short 3-5 word descriptions.
 */
export function startSeeItSignItTour() {
  const steps: DriveStep[] = [
    {
      element: '.sisi-instruction-card',
      popover: {
        title: '🏷️ Pangalan ng Sign',
        description: 'I-sign mo ang salitang ito!',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.sisi-image-card-container',
      popover: {
        title: '🖼️ Tingnan ang Larawan',
        description: 'Ito ang iyong clue! Tingnan nang mabuti.',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '.sisi-camera-wrapper',
      popover: {
        title: '📷 Ikaw Ito!',
        description: 'Itapat ang kamay sa gitna ng camera! ✋',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '.ps-bottom-controls',
      popover: {
        title: '✋ Check My Sign',
        description: 'Pindutin ito kapag ready ka na mag-sign!',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '.sisi-score-card',
      popover: {
        title: '🔥 Iyong Points!',
        description: 'Dito dadami ang iyong score at stars! 🏆',
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
 * Simple Taglish, short 3-5 word descriptions.
 */
export function startPuzzleSignTour() {
  const steps: DriveStep[] = [
    {
      element: '.eval-instruction-card',
      popover: {
        title: '🧩 Puzzle Clue',
        description: 'Basahin ang clue para masagot ang puzzle!',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.ps-puzzle-card',
      popover: {
        title: '➕ Ano ang Nawawala?',
        description: 'Hulaan kung ano ang sign sa "?" mark!',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '.eval-camera-wrapper',
      popover: {
        title: '📷 I-Sign ang Sagot!',
        description: 'Ipakita sa camera ang iyong sagot! ✋',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '.ps-bottom-controls',
      popover: {
        title: '✨ I-Check ang Sagot',
        description: 'Pindutin ito para malaman kung tama ka!',
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
 * 4. Magic Fingers Mini-Game Tour
 * Simple Taglish, short 3-5 word descriptions.
 */
export function startMagicFingersTour() {
  const steps: DriveStep[] = [
    {
      element: '.sisi-instruction-card',
      popover: {
        title: '🔤 Sikretong Salita',
        description: 'May nawawalang letra! Hulaan ito.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.sisi-camera-wrapper',
      popover: {
        title: '🤟 I-Spell ang Letra!',
        description: 'I-sign ang nawawalang letra sa camera!',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '.ps-bottom-controls',
      popover: {
        title: '🪄 I-Check ang Letra',
        description: 'Pindutin ito para lumabas ang secret letter!',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '.sisi-score-card',
      popover: {
        title: '🏆 Iyong Score',
        description: 'Mag-ipon ng points sa bawat tamang letra! ⭐',
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
