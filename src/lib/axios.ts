import axios from "axios";
import { getSession, signOut } from "next-auth/react";

export const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

let isHandlingExpiry = false;

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      try {
        const session = await getSession();
        const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch {
        // Proceed without token for public endpoints
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const requestUrl: string = error?.config?.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/social-login");

    if (
      typeof window !== "undefined" &&
      status === 401 &&
      !isAuthEndpoint &&
      !isHandlingExpiry
    ) {
      const path = window.location.pathname;
      const isProtectedPath =
        path.startsWith("/dashboard") ||
        path.startsWith("/admin") ||
        path.startsWith("/provider");

      if (isProtectedPath) {
        isHandlingExpiry = true;
        try {
          await signOut({ redirect: false });
        } finally {
          window.location.href = "/login?expired=true";
          setTimeout(() => {
            isHandlingExpiry = false;
          }, 3000);
        }
      }
    }

    return Promise.reject(error);
  }
);
