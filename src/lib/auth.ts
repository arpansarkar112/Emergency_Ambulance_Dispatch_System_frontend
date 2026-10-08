import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }, // For demo login
      },
      async authorize(credentials) {
        try {
          if (credentials?.role && !credentials?.password) {
             // Optional: Handle Demo Login logic here if the backend supports it, 
             // or mock it for demo purposes if backend doesn't have a demo endpoint.
             // Usually, demo login just auto-fills credentials. We will assume the frontend 
             // login form passes real credentials for the demo accounts.
          }

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
        } catch (error: any) {
          throw new Error(error.response?.data?.message || "Invalid credentials");
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const res = await axios.post(`${API_URL}/auth/social-login`, {
            idToken: account.id_token, // Backend needs idToken
          });
          if (res.data.success && res.data.data) {
            // Map backend token to NextAuth user object
            (user as any).role = res.data.data.user.role || "user";
            (user as any).accessToken = res.data.data.accessToken;
            user.id = res.data.data.user.id;
            return true;
          }
          return false;
        } catch (error) {
          console.error("Social login failed", error);
          return false; // Return false to deny access
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
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
