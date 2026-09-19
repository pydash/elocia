import { generateRandomNumber } from "./numberGenerator";

export function getStreakMessage(streak: number) {
  const onStreakMessages: Record<number, string> = {
    1: "Great start! Keep it up!",
    2: "Awesome! You're on a roll!",
    3: "Fantastic! You're doing amazing!",
    4: "Incredible! You're unstoppable!",
    5: "Legendary! You're a streak master!",
  };

  if (streak === 0) {
    return "Start your streak today!";
  } else if (streak >= 1) {
    return onStreakMessages[generateRandomNumber()];
  }
}
