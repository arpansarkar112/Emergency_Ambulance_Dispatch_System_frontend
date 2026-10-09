import axios from "axios";
import { getSession } from "next-auth/react";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://emergency-ambulance-dispatch-system-seven.vercel.app/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach token to requests
api.interceptors.request.use(
  async (config) => {
    // We only use getSession on the client-side.
    // For server-side requests, we should pass the token manually or use auth options.
    if (typeof window !== "undefined") {
      const session = await getSession();
      if (session && (session as any).accessToken) {
        config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
