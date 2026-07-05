import { baseUrl } from "../services/commons";

const TOKEN_KEY = "lt_token";
const USER_KEY = "lt_user";

export interface AuthUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

interface AuthResponse extends AuthUser {
  token: string;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function isAdmin(): boolean {
  return getCurrentUser()?.role === "ADMIN";
}

/**
 * Exchanges a Google ID token (credential) for an app session.
 * Throws with a readable message if the account is not registered/active.
 */
export async function loginWithGoogle(idToken: string): Promise<AuthUser> {
  const res = await fetch(`${baseUrl}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    let message = "Sign-in failed. Please try again.";
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }

  const data: AuthResponse = await res.json();
  const { token, ...user } = data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
