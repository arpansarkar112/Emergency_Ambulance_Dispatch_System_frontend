import axios from "axios";
import { getSession } from "next-auth/react";

export const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      try {
        const session = await getSession();
        const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.warn("Failed to fetch session for axios interceptor", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);
