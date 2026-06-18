import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { api } from '@/lib/api';
import type { Role } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
    accessToken: string;
  }

  interface User {
    id: string;
    role: Role;
    accessToken: string;
  }
}

type AuthJwt = {
  userId?: string;
  role?: Role;
  accessToken?: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const result = await api.login({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            accessToken: result.accessToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      const authToken = token as AuthJwt;
      if (user) {
        authToken.userId = user.id;
        authToken.role = user.role;
        authToken.accessToken = user.accessToken;
      }
      return authToken;
    },
    async session({ session, token }) {
      const authToken = token as AuthJwt;
      return {
        ...session,
        user: {
          ...session.user,
          id: authToken.userId || '',
          role: authToken.role || 'seeker',
        },
        accessToken: authToken.accessToken || '',
      };
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
});
