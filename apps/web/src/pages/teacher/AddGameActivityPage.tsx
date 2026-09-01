import { useLocation } from "react-router-dom";
import {
  SeeItSignItCreateActivityStepOnePage,
  SeeItSignItCreateActivityStepTwoPage,
  SeeItSignItCreateActivityStepThreePage,
} from "./games-pages/SeeItSignItCreateActivityPage";
import {
  PuzzleSignCreateActivityStepOnePage,
  PuzzleSignCreateActivityStepTwoPage,
  PuzzleSignCreateActivityStepThreePage,
} from "./games-pages/PuzzleSignCreateActivityPage";
import {
  MagicFingersCreateActivityStepOnePage,
  MagicFingersCreateActivityStepTwoPage,
  MagicFingersCreateActivityStepThreePage,
} from "./games-pages/MagicFingersCreateActivityPage";

export function TeacherAddGameActivityStepOnePage() {
  const location = useLocation();
  const gameName = location.pathname.split("/")[3];

  if (gameName === "see-it-sign-it") {
    return <SeeItSignItCreateActivityStepOnePage />;
  } else if (gameName === "puzzle-sign") {
    return <PuzzleSignCreateActivityStepOnePage />;
  } else if (gameName === "magic-fingers") {
    return <MagicFingersCreateActivityStepOnePage />;
  } else {
    return <div>Game not found</div>;
  }
}

export function TeacherAddGameActivityStepTwoPage() {
  const location = useLocation();
  const gameName = location.pathname.split("/")[3];

  if (gameName === "see-it-sign-it") {
    return <SeeItSignItCreateActivityStepTwoPage />;
  } else if (gameName === "puzzle-sign") {
    return <PuzzleSignCreateActivityStepTwoPage />;
  } else if (gameName === "magic-fingers") {
    return <MagicFingersCreateActivityStepTwoPage />;
  } else {
    return <div>Game not found</div>;
  }
}

export function TeacherAddGameActivityStepThreePage() {
  const location = useLocation();
  const gameName = location.pathname.split("/")[3];

  if (gameName === "see-it-sign-it") {
    return <SeeItSignItCreateActivityStepThreePage />;
  } else if (gameName === "puzzle-sign") {
    return <PuzzleSignCreateActivityStepThreePage />;
  } else if (gameName === "magic-fingers") {
    return <MagicFingersCreateActivityStepThreePage />;
  } else {
    return <div>Game not found</div>;
  }
}
