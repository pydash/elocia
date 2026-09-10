import type { LoginRequest, LoginResponse } from "@/interfaces/login.interface";

const API_BASE_URL = "http://localhost:8000";

export const authService = {
  setAccessToken: (token: string) => {
    localStorage.setItem("access_token", token);
  },

  getAccessToken: () => {
    return localStorage.getItem("access_token");
  },

  clearAccessToken: () => {
    localStorage.removeItem("access_token");
  },
};

export async function adultLogin({
  username,
  password,
}: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Login failed");
  }

  const data = await response.json();
  authService.setAccessToken(data.access_token);

  return data;
}
