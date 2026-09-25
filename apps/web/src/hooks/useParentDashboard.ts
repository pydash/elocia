"use client";
import { useState, useEffect, useCallback } from "react";
import { getIdFromToken, getNameFromToken, tokenManager } from "@/helpers/jwt";
import type {
  ParentStudent,
  ParentProgressSummary,
  EvaluationAttemptItem,
  ParameterMasteryItem,
  PerformanceTrendItem,
  StagePathItem,
  AchievementItem,
} from "@/interfaces/parent.interface";
import {
  fetchParentStudents,
  fetchParentProgressSummary,
  fetchStudentScores,
  fetchCurriculumStages,
} from "@/services/parent-progress";

export interface DashboardStats {
  overallProgress: number; // e.g. 78
  avgScore: number;        // e.g. 94
  unitsCompleted: number;  // e.g. 12
  streak: number;          // e.g. 7
}

export function useParentDashboard() {
  const token = tokenManager.getAccessToken();
  const parentName = token ? getNameFromToken(token) : null;

  const [children, setChildren] = useState<ParentStudent[]>([]);
  const [selectedChild, setSelectedChild] = useState<ParentStudent | null>(null);
  const [summary, setSummary] = useState<ParentProgressSummary | null>(null);
  const [scores, setScores] = useState<EvaluationAttemptItem[]>([]);
  
  const [stats, setStats] = useState<DashboardStats>({
    overallProgress: 0,
    avgScore: 0,
    unitsCompleted: 0,
    streak: 0,
  });

  const [stagePath, setStagePath] = useState<StagePathItem[]>([
    { stageNumber: 1, title: "Stage 1", status: "current", progressPercentage: 0 },
    { stageNumber: 2, title: "Stage 2", status: "locked" },
    { stageNumber: 3, title: "Stage 3", status: "locked" },
    { stageNumber: 4, title: "Stage 4", status: "locked" },
  ]);

  const [parameterMastery, setParameterMastery] = useState<ParameterMasteryItem[]>([
    { name: "Handshape", key: "handshape", value: 0 },
    { name: "Palm Orientation", key: "palm_orientation", value: 0 },
    { name: "Location", key: "location", value: 0 },
    { name: "Movement", key: "movement", value: 0 },
  ]);

  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrendItem[]>([]);

  const [achievements, setAchievements] = useState<AchievementItem[]>([
    {
      id: "fast_learner",
      name: "Fast Learner",
      description: "Quick mastery of initial signs",
      iconType: "lightning",
      unlocked: false,
      color: "gray",
    },
    {
      id: "sign_master",
      name: "Sign Master",
      description: "Achieved >80% average score",
      iconType: "snake",
      unlocked: false,
      color: "gray",
    },
    {
      id: "consistent",
      name: "Dedicated Signer",
      description: "Maintained a 3+ day practice streak",
      iconType: "medal",
      unlocked: false,
      color: "gray",
    },
    {
      id: "stage_champ",
      name: "Stage Champion",
      description: "Completed full section evaluation",
      iconType: "trophy",
      unlocked: false,
      color: "gray",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial Load: Fetch Parent's Children
  const loadParentChildren = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = tokenManager.getAccessToken();
      const parentId = token ? getIdFromToken(token) : null;

      if (!parentId) {
        throw new Error("Parent session not found. Please log in again.");
      }

      const kids = await fetchParentStudents(parentId);
      setChildren(kids);

      if (kids.length > 0) {
        setSelectedChild((prev) => (prev ? kids.find((k) => k.id === prev.id) || kids[0] : kids[0]));
      }
    } catch (err: any) {
      console.error("Error loading parent children:", err);
      setError(err?.message || "Failed to load children");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadParentChildren();
  }, [loadParentChildren]);

  // 2. Load Child Performance Data when selectedChild changes
  useEffect(() => {
    if (!selectedChild) return;

    let isMounted = true;

    async function loadChildMetrics() {
      try {
        const studentId = selectedChild?.id || selectedChild?.student_id;
        if (!studentId) return;

        const [summaryData, attemptsData, curriculumData] = await Promise.all([
          fetchParentProgressSummary(studentId).catch(() => null),
          fetchStudentScores(studentId).catch(() => []),
          fetchCurriculumStages(selectedChild?.grade_level).catch(() => null),
        ]);

        if (!isMounted) return;

        setSummary(summaryData);
        setScores(attemptsData || []);

        // Compute Live Stats
        const validAttempts = (attemptsData || []).filter((a: EvaluationAttemptItem) => a.score_overall > 0);
        const passedAttempts = (attemptsData || []).filter((a: EvaluationAttemptItem) => a.passed);

        // Passed Stages count
        const distinctStagesPassed = new Set(
          passedAttempts.map((a: EvaluationAttemptItem) => a.stage_id_new || a.stage_id).filter(Boolean)
        ).size;

        // Total curriculum stages available
        let totalStages = 10;
        if (curriculumData?.sections) {
          const allStages = curriculumData.sections.flatMap((s: any) => s.units.flatMap((u: any) => u.stages));
          if (allStages.length > 0) totalStages = allStages.length;
        }

        const calculatedOverall = distinctStagesPassed > 0
          ? Math.min(100, Math.round((distinctStagesPassed / totalStages) * 100))
          : 0;

        const realAvg = summaryData?.avg_score
          ? Math.round(summaryData.avg_score)
          : validAttempts.length > 0
          ? Math.round(validAttempts.reduce((acc: number, a: EvaluationAttemptItem) => acc + a.score_overall, 0) / validAttempts.length)
          : 0;

        const realStreak = selectedChild?.streak ?? summaryData?.streak ?? 0;
        const realCompleted = distinctStagesPassed;

        setStats({
          overallProgress: calculatedOverall,
          avgScore: realAvg,
          unitsCompleted: realCompleted,
          streak: realStreak,
        });

        // Compute Live 4-Parameter Mastery
        if (validAttempts.length > 0) {
          const avgH = Math.round(validAttempts.reduce((acc: number, a: EvaluationAttemptItem) => acc + (a.score_handshape || 0), 0) / validAttempts.length);
          const avgP = Math.round(validAttempts.reduce((acc: number, a: EvaluationAttemptItem) => acc + (a.score_palm_orientation || 0), 0) / validAttempts.length);
          const avgL = Math.round(validAttempts.reduce((acc: number, a: EvaluationAttemptItem) => acc + (a.score_location || 0), 0) / validAttempts.length);
          const avgM = Math.round(validAttempts.reduce((acc: number, a: EvaluationAttemptItem) => acc + (a.score_movement || 0), 0) / validAttempts.length);

          setParameterMastery([
            { name: "Handshape", key: "handshape", value: avgH },
            { name: "Palm Orientation", key: "palm_orientation", value: avgP },
            { name: "Location", key: "location", value: avgL },
            { name: "Movement", key: "movement", value: avgM },
          ]);
        } else {
          setParameterMastery([
            { name: "Handshape", key: "handshape", value: 0 },
            { name: "Palm Orientation", key: "palm_orientation", value: 0 },
            { name: "Location", key: "location", value: 0 },
            { name: "Movement", key: "movement", value: 0 },
          ]);
        }

        // Compute Performance Trend
        if (validAttempts.length > 0) {
          const chronological = [...validAttempts].sort(
            (a, b) => new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
          );
          const recentAttempts = chronological.slice(-5);
          const trendItems: PerformanceTrendItem[] = recentAttempts.map((attempt, index) => ({
            label:
              recentAttempts.length === 1
                ? "Session 1"
                : index === recentAttempts.length - 1
                ? "Latest"
                : `Session ${index + 1}`,
            score: Math.round(attempt.score_overall),
            isCurrent: index === recentAttempts.length - 1,
          }));
          setPerformanceTrend(trendItems);
        } else {
          setPerformanceTrend([]);
        }

        // Live Stage Path Status
        const stage1Passed = distinctStagesPassed >= 1;
        setStagePath([
          { stageNumber: 1, title: "Stage 1", status: stage1Passed ? "completed" : "current", progressPercentage: stage1Passed ? 100 : 0 },
          { stageNumber: 2, title: "Stage 2", status: stage1Passed ? "current" : "locked", progressPercentage: 0 },
          { stageNumber: 3, title: "Stage 3", status: "locked" },
          { stageNumber: 4, title: "Stage 4", status: "locked" },
        ]);

        // Live Achievements
        const hasHighAvg = realAvg >= 80 && validAttempts.length > 0;
        const hasStreak = realStreak >= 3;
        const hasCompletedStage = distinctStagesPassed >= 1;

        setAchievements([
          {
            id: "fast_learner",
            name: "Fast Learner",
            description: "Quick mastery of initial signs",
            iconType: "lightning",
            unlocked: validAttempts.length > 0,
            color: validAttempts.length > 0 ? "orange" : "gray",
          },
          {
            id: "sign_master",
            name: "Sign Master",
            description: "Achieved >80% average score",
            iconType: "snake",
            unlocked: hasHighAvg,
            color: hasHighAvg ? "green" : "gray",
          },
          {
            id: "consistent",
            name: "Dedicated Signer",
            description: "Maintained a 3+ day practice streak",
            iconType: "medal",
            unlocked: hasStreak,
            color: hasStreak ? "orange" : "gray",
          },
          {
            id: "stage_champ",
            name: "Stage Champion",
            description: "Completed full section evaluation",
            iconType: "trophy",
            unlocked: hasCompletedStage,
            color: hasCompletedStage ? "green" : "gray",
          },
        ]);
      } catch (e) {
        console.error("Error computing child metrics:", e);
      }
    }

    loadChildMetrics();

    return () => {
      isMounted = false;
    };
  }, [selectedChild]);

  return {
    parentName,
    children,
    selectedChild,
    setSelectedChild,
    summary,
    scores,
    stats,
    stagePath,
    parameterMastery,
    performanceTrend,
    achievements,
    loading,
    error,
    refetch: loadParentChildren,
  };
}

