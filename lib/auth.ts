import clientPromise from "@/lib/mongodb-adapter";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import TodoistProvider from "next-auth/providers/todoist";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  debug: process.env.NODE_ENV === "development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TodoistProvider({
      clientId: process.env.TODOIST_CLIENT_ID!,
      clientSecret: process.env.TODOIST_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({ user, account }) {
      // For Todoist, save the tokens
      if (account?.provider === "todoist" && user.email) {
        const client = await clientPromise;
        const db = client.db();

        await db.collection("users").updateOne(
          { email: user.email },
          {
            $set: {
              "integrations.todoist": {
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: new Date(
                  Date.now() + Number(account.expires_in || 0) * 1000
                ),
              },
            },
          }
        );
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to dashboard instead of homepage
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }
      // Allows relative callback URLs
      else if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return url;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  events: {
    async createUser({ user }) {
      // Initialize user with free tier
      if (user.email) {
        const client = await clientPromise;
        const db = client.db();

        await db.collection("users").updateOne(
          { email: user.email },
          {
            $set: {
              subscription: {
                status: "free",
              },
              usage: {
                summariesThisMonth: 0,
              },
              integrations: {},
            },
          }
        );
      }
    },
  },
};
