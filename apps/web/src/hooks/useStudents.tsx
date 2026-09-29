import { useState, useEffect, useCallback } from "react";
import {
  fetchStudentById,
  fetchStudents,
  createStudent,
  updateStudent,
  deactivateStudent,
  reactivateStudent,
  type CreateStudentPayload,
  type UpdateStudentPayload,
} from "@/services/students";
import type { Student } from "@/interfaces/student.interface";

export function useGetStudents(initialStatus: "all" | "active" | "inactive" = "all") {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const reloadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchStudents(initialStatus);
      setStudents(data);
    } catch (err) {
      err instanceof Error
        ? setError(err.message)
        : setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [initialStatus]);

  useEffect(() => {
    reloadStudents();
  }, [reloadStudents]);

  const addStudent = async (payload: CreateStudentPayload) => {
    const newStudent = await createStudent(payload);
    setStudents((currentStudents) => [...currentStudents, newStudent]);
    return newStudent;
  };

  const deactivateStudentById = async (studentId: string) => {
    // Optimistic local update
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, is_active: false } : s))
    );
    try {
      await deactivateStudent(studentId);
    } catch (err) {
      // Rollback
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, is_active: true } : s))
      );
      throw err;
    }
  };

  const reactivateStudentById = async (studentId: string) => {
    // Optimistic local update
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, is_active: true } : s))
    );
    try {
      await reactivateStudent(studentId);
    } catch (err) {
      // Rollback
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, is_active: false } : s))
      );
      throw err;
    }
  };

  return {
    students,
    setStudents,
    loading,
    error,
    addStudent,
    deactivateStudentById,
    reactivateStudentById,
    reloadStudents,
  };
}

export function useGetStudentById(id: string) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function getStudent() {
      try {
        const data = await fetchStudentById(id);
        setStudent(data);
      } catch (err) {
        err instanceof Error
          ? setError(err.message)
          : setError("An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    getStudent();
  }, [id]);

  const editStudent = async (payload: UpdateStudentPayload) => {
    const updatedStudent = await updateStudent(id, payload);
    setStudent(updatedStudent);
    return updatedStudent;
  };

  return { student, loading, error, editStudent };
}
