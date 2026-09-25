import type {
  Curriculum,
  Section,
  Stage,
  Unit,
} from "@/interfaces/curriculum.interface";
import { useCallback, useEffect, useState } from "react";
import {
  fetchCurriculums,
  fetchSectionsByCurriculumId,
  fetchUnitsBySectionId,
  fetchStagesByUnitId,
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

export function useGetSections(curriculumId: string) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSections = async () => {
      try {
        const data = await fetchSectionsByCurriculumId(curriculumId);
        setSections(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    getSections();
  }, [curriculumId]);

  return { sections, loading, error };
}

export function useGetUnits(sectionId: string) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUnits = async () => {
      try {
        const data = await fetchUnitsBySectionId(sectionId);
        setUnits(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    getUnits();
  }, [sectionId]);

  return { units, loading, error };
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
