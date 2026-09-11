import { jwtDecode } from "jwt-decode";

export const tokenManager = {
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

export function decodeToken(token: string | null) {
  if (!token) {
    throw new Error("No token provided");
  }
  try {
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    throw new Error("Failed to decode token");
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded: any = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true; // If the token is invalid or doesn't have an exp field, consider it expired
  }

  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return decoded.exp < currentTime;
}

export function getIdFromToken(token: string): string | null {
  const decoded: any = decodeToken(token);
  if (!decoded || !decoded.sub) {
    return null; // If the token is invalid or doesn't have a sub field, return null
  }
  return decoded.sub;
}

export function getNameFromToken(token: string): string | null {
  const decoded: any = decodeToken(token);
  if (!decoded || !decoded.name) {
    return null; // If the token is invalid or doesn't have a name field, return null
  }
  return decoded.name;
}

export function getRoleFromToken(token: string): string | null {
  const decoded: any = decodeToken(token);
  if (!decoded || !decoded.role) {
    return null; // If the token is invalid or doesn't have a role field, return null
  }
  return decoded.role;
}

const token = tokenManager.getAccessToken();
console.log(decodeToken(token));
