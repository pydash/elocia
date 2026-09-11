import { useState, useEffect } from "react";
import { fetchStudents } from "@/services/students";
import type { Student } from "@/interfaces/student.interface";

export function useGetStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function getStudents() {
      try {
        const data = await fetchStudents();
        setStudents(data);
      } catch (err) {
        err instanceof Error
          ? setError(err.message)
          : setError("An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    getStudents();
  }, []);

  return { students, loading, error };
}
