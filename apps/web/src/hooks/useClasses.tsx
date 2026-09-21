import type { Class } from "@/interfaces/class.interface";
import { fetchTeacherClasses } from "@/services/classes";
import { useEffect, useState } from "react";

export function useGetClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function getClasses() {
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
    }

    getClasses();
  }, []);

  return { classes, loading, error };
}
