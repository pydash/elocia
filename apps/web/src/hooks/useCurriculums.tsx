import type {
  Curriculum,
  Section,
  Stage,
  Unit,
} from "@/interfaces/curriculum.interface";
import { useCallback, useEffect, useState } from "react";
import {
  fetchCurriculums,
  fetchCurriculumById,
  fetchSectionsByCurriculumId,
  fetchUnitsBySectionId,
  fetchStagesByUnitId,
  updateCurriculum,
} from "@/services/curriculum";

export function useGetCurriculums() {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCurriculums = async () => {
      try {
        const data = await fetchCurriculums();
        setCurriculums(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    getCurriculums();
  }, []);

  return { curriculums, loading, error };
}

export function useCurriculum(curriculumId: string) {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getCurriculum() {
      try {
        const data = await fetchCurriculumById(curriculumId);
        setCurriculum(data);
      } catch (err) {
        err instanceof Error
          ? setError(err.message)
          : setError("An error occurred");
      } finally {
        setLoading(false);
      }
    }

    getCurriculum();
  }, [curriculumId]);

  const editCurriculum = async (payload: Partial<Curriculum>) => {
    try {
      setLoading(true);
      const updatedCurriculum = await updateCurriculum(curriculumId, payload);
      setCurriculum(updatedCurriculum);
    } catch (err) {
      err instanceof Error
        ? setError(err.message)
        : setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { curriculum, loading, error, updateCurriculum: editCurriculum };
}

export function useGetSections(curriculumId: string) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSections = useCallback(async () => {
    if (!curriculumId) return;
    try {
      setLoading(true);
      const data = await fetchSectionsByCurriculumId(curriculumId);
      setSections(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [curriculumId]);

  useEffect(() => {
    getSections();
  }, [getSections]);

  return { sections, loading, error, refresh: getSections, setSections };
}

export function useGetUnits(sectionId: string) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUnits = useCallback(async () => {
    if (!sectionId) return;
    try {
      setLoading(true);
      const data = await fetchUnitsBySectionId(sectionId);
      setUnits(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    getUnits();
  }, [getUnits]);

  return { units, loading, error, refresh: getUnits, setUnits };
}

export function useGetStages(unitId: string) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStagesByUnitId(unitId);
      setStages(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    getStages();
  }, [getStages]);

  return { stages, loading, error, refresh: getStages };
}
