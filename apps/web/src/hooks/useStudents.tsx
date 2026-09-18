import { useState, useEffect } from "react";
import {
  fetchStudentById,
  fetchStudents,
  createStudent,
  updateStudent,
  type CreateStudentPayload,
  type UpdateStudentPayload,
} from "@/services/students";
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

  const addStudent = async (payload: CreateStudentPayload) => {
    const newStudent = await createStudent(payload);
    setStudents((currentStudents) => [...currentStudents, newStudent]);
    return newStudent;
  };

  return { students, loading, error, addStudent };
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
