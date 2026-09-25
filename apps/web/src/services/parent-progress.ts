import type {
  ParentStudent,
  ParentProgressSummary,
  EvaluationAttemptItem,
} from "@/interfaces/parent.interface";
import { extractApiErrorMessage } from "@/helpers/error";

const API_BASE_URL = "http://localhost:8000";

/**
 * Fetch all students linked to the authenticated parent.
 */
export async function fetchParentStudents(parentId: string): Promise<ParentStudent[]> {
  const response = await fetch(`${API_BASE_URL}/parents/${parentId}/students`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(extractApiErrorMessage(error, "Failed to fetch linked children"));
  }

  return response.json();
}

/**
 * Fetch performance summary, strengths, and recommendations for a student.
 */
export async function fetchParentProgressSummary(
  studentId: string
): Promise<ParentProgressSummary> {
  const response = await fetch(`${API_BASE_URL}/analytics/parent/${studentId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(extractApiErrorMessage(error, "Failed to fetch student progress summary"));
  }

  return response.json();
}

/**
 * Fetch evaluation attempts and raw parameter scores for a student.
 */
export async function fetchStudentScores(
  studentId: string
): Promise<EvaluationAttemptItem[]> {
  const response = await fetch(`${API_BASE_URL}/scores/${studentId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(extractApiErrorMessage(error, "Failed to fetch student evaluation scores"));
  }

  return response.json();
}

/**
 * Fetch full curriculum structure to calculate overall student progress.
 */
export async function fetchCurriculumStages(gradeLevel?: number): Promise<any> {
  const url = gradeLevel
    ? `${API_BASE_URL}/curriculum?grade_level=${gradeLevel}`
    : `${API_BASE_URL}/curriculum`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

