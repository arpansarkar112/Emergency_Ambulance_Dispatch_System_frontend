import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://emergency-ambulance-dispatch-system-seven.vercel.app/api/v1";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        idToken: { label: "Google ID Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (credentials?.idToken) {
            // Google Social Login Flow
            const res = await axios.post(`${API_URL}/auth/social-login`, {
              idToken: credentials.idToken,
            });
            const data = res.data;
            if (data.success && data.data) {
              return {
                id: data.data.user.id,
                name: data.data.user.name || data.data.user.firstName,
                email: data.data.user.email,
                role: data.data.user.role,
                accessToken: data.data.accessToken,
              };
            }
            return null;
          } else {
            // Standard Email/Password Flow
            const res = await axios.post(`${API_URL}/auth/login`, {
              email: credentials?.email,
              password: credentials?.password,
            });

            const data = res.data;
            
            if (data.success && data.data) {
              return {
                id: data.data.user.id,
                name: data.data.user.name || data.data.user.firstName,
                email: data.data.user.email,
                role: data.data.user.role,
                accessToken: data.data.accessToken,
              };
            }
            return null;
          }
        } catch (error: any) {
          throw new Error(error.response?.data?.message || "Authentication failed");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
