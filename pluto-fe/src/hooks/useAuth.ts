const SESSION_KEY = "lt_session";

export function isAuthenticated(): boolean {
  // return !!localStorage.getItem(SESSION_KEY);
  return true;
}

export function login(username: string, password: string): boolean {
  // Replace with a real API call when backend auth is ready
  // if (username === "admin" && password === "admin123") {
  //   localStorage.setItem(SESSION_KEY, btoa(`${username}:${Date.now()}`));
  //   return true;
  // }
  return true;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
