import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }, // for demo login
      },
      async authorize(credentials) {
        // Mock authorization for demo purposes
        if (credentials?.email && credentials?.password) {
          // If demo role is provided, mock the user
          if (credentials.role) {
            return {
              id: Math.random().toString(),
              name: `Demo ${credentials.role}`,
              email: credentials.email,
              role: credentials.role,
            };
          }
          
          // Regular login simulation
          if (credentials.email === "admin@example.com") {
            return { id: "1", name: "Admin User", email: "admin@example.com", role: "admin" };
          }
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
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
};
