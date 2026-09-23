import { useEffect, useState } from "react";

import { fetchTeacherClasses, fetchClassRoster } from "@/services/classes";
import type { Class, Roster } from "@/interfaces/class.interface";

export function useGetClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const getClasses = async () => {
      try {
        const data = await fetchTeacherClasses();
        setClasses(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    getClasses();
  }, []);

  return { classes, loading, error };
}

export function useGetClassRoster(classId: string | undefined) {
  const [roster, setRoster] = useState<Roster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const getClassRoster = async () => {
      try {
        const roster = await fetchClassRoster(classId);
        setRoster(roster);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    getClassRoster();
  }, [classId]);

  return { roster, loading, error };
}
