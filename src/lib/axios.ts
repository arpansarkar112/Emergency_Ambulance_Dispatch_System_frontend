import axios from "axios";
import { getSession } from "next-auth/react";

export const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach token to requests
api.interceptors.request.use(
  async (config) => {
    // We only use getSession on the client-side.
    if (typeof window !== "undefined") {
      try {
        const session = await getSession();
        if (session && (session as any).accessToken) {
          config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
        }
      } catch (err) {
        console.warn("Failed to fetch session for axios interceptor", err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
