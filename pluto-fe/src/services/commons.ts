import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

export const baseUrl = "http://localhost:8080/api";
// export const baseUrl = "/api";

// Google OAuth 2.0 Web client ID (see .env / .env.example)
export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

/**
 * Attaches the stored app JWT as a Bearer token to outgoing API requests.
 */
const prepareAuthHeaders = (headers: Headers) => {
  const token = localStorage.getItem("lt_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
};

const rawBaseQuery = fetchBaseQuery({ baseUrl, prepareHeaders: prepareAuthHeaders });

/**
 * Shared base query for all RTK Query APIs. Sends the Bearer token and, on a
 * 401 (missing/expired/invalid token), clears the session and redirects to login.
 */
export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    localStorage.removeItem("lt_token");
    localStorage.removeItem("lt_user");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return result;
};
