// pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // Include the Google Calendar scope
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Retrieve user from Vercel KV
        const user = await kv.hgetall(`user:${email}`);
        if (!user) {
          throw new Error('Invalid email or password.');
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          throw new Error('Invalid email or password.');
        }

        // Return user object
        return { email: user.email };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && account.provider === 'google') {
        // Store the access and refresh tokens for Google account
        if (account.access_token) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.accessTokenExpires = account.expires_at * 1000;
        }
      } else if (user) {
        // For Credentials provider
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      if (token.email) {
        // For Credentials provider
        session.user.email = token.email;
      }
      if (token.accessToken) {
        // For Google provider
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.accessTokenExpires = token.accessTokenExpires;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);