import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const PROD_FRONTEND_URL = "https://emergency-ambulance-dispatch-system-iota.vercel.app";
const PROD_BACKEND_API_URL = "https://emergency-ambulance-dispatch-system-seven.vercel.app/api/v1";

// Ensure NEXTAUTH_URL never points to localhost when deployed on Vercel/production
if (
  (process.env.VERCEL || process.env.NODE_ENV === "production") &&
  (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("localhost"))
) {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || PROD_FRONTEND_URL;
  process.env.NEXTAUTH_URL = host.startsWith("http") ? host : `https://${host}`;
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
const API_URL =
  rawApiUrl &&
  !((process.env.VERCEL || process.env.NODE_ENV === "production") && rawApiUrl.includes("localhost"))
    ? rawApiUrl.replace(/\/$/, "")
    : PROD_BACKEND_API_URL;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        idToken: { label: "Google ID Token", type: "text" },
        accessToken: { label: "Access Token", type: "text" },
        userJson: { label: "User JSON", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (credentials?.accessToken && credentials?.userJson) {
            const parsedUser = JSON.parse(credentials.userJson);
            const fullName =
              parsedUser.name ||
              [parsedUser.profile?.firstName, parsedUser.profile?.lastName]
                .filter(Boolean)
                .join(" ") ||
              parsedUser.email;
            return {
              id: parsedUser.id,
              name: fullName,
              email: parsedUser.email,
              role: parsedUser.role,
              image: parsedUser.avatarUrl || parsedUser.profile?.avatarUrl || null,
              accessToken: credentials.accessToken,
            };
          } else if (credentials?.idToken) {
            const res = await axios.post(`${API_URL}/auth/social-login`, {
              idToken: credentials.idToken,
            });
            const data = res.data;
            if (data.success && data.data) {
              return {
                id: data.data.user.id,
                name: data.data.user.name || data.data.user.firstName || data.data.user.email,
                email: data.data.user.email,
                role: data.data.user.role,
                image: data.data.user.avatarUrl || null,
                accessToken: data.data.accessToken,
              };
            }
            return null;
          } else {
            const res = await axios.post(`${API_URL}/auth/login`, {
              email: credentials?.email,
              password: credentials?.password,
            });

            const data = res.data;
            if (data.success && data.data) {
              return {
                id: data.data.user.id,
                name: data.data.user.name || data.data.user.firstName || data.data.user.email,
                email: data.data.user.email,
                role: data.data.user.role,
                image: data.data.user.avatarUrl || null,
                accessToken: data.data.accessToken,
              };
            }
            return null;
          }
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } }; message?: string };
          throw new Error(err.response?.data?.message || err.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as unknown as {
          id: string;
          role: string;
          accessToken: string;
          image?: string | null;
        };
        token.role = u.role;
        token.accessToken = u.accessToken;
        token.id = u.id;
        token.picture = u.image || null;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image !== undefined) token.picture = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const su = session.user as unknown as {
          id?: string;
          role?: string;
          accessToken?: string;
          image?: string | null;
        };
        su.role = token.role as string;
        su.accessToken = token.accessToken as string;
        su.id = token.id as string;
        su.image = (token.picture as string | null) || null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const isProd = Boolean(process.env.VERCEL || process.env.NODE_ENV === "production");
      const effectiveBase = isProd && baseUrl.includes("localhost") ? PROD_FRONTEND_URL : baseUrl;

      if (url.startsWith("/")) return `${effectiveBase}${url}`;
      if (isProd && url.includes("localhost")) {
        return url.replace(/^https?:\/\/localhost:\d+/, effectiveBase);
      }
      return url;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days matching backend JWT
  },
  secret:
    process.env.NEXTAUTH_SECRET || "my_super_secret_jwt_token_for_nextauth_development",
};
