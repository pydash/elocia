"use client";
import { useState } from "react";
import { adultLogin } from "@/services/auth";

export function useAdultLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError("");
      const response = await adultLogin({ username, password });
      return response;
    } catch (err) {
      err instanceof Error
        ? setError(err.message)
        : setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
  };
}
