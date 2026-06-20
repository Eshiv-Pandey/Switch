import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, aiAccounts, projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

async function seedUserDefaults(userId: string) {
  const defaultOrKey = process.env.DEFAULT_OPENROUTER_KEY;
  if (defaultOrKey && !defaultOrKey.includes("ReplaceWith")) {
    await db.insert(aiAccounts).values({
      id: generateId(),
      userId,
      provider: "openrouter",
      accountLabel: "OpenRouter (Free)",
      apiKey: defaultOrKey,
      isActive: true,
    });
  }

  await db.insert(projects).values({
    id: generateId(),
    userId,
    name: "Getting Started",
    description: "Your first AI workspace. Start chatting, switch models anytime.",
    emoji: "🚀",
    color: "#c8f400",
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "text" }, // "login" or "register"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const email = credentials.email as string;
        const password = credentials.password as string;
        const action = credentials.action as string;

        const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
        const user = existing[0];

        if (action === "register") {
          if (user) throw new Error("Email already registered");
          
          const hashedPassword = await bcrypt.hash(password, 10);
          const userId = generateId();
          
          await db.insert(users).values({
            id: userId,
            email,
            password: hashedPassword,
          });

          await seedUserDefaults(userId);

          return { id: userId, email };
        }

        // Login flow
        if (!user || !user.password) {
          throw new Error("Invalid credentials or user signed up with Google.");
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      }
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);

      if (existing.length === 0) {
        // ── New Google user: create account + seed defaults ──────────────────
        const userId = generateId();

        await db.insert(users).values({
          id: userId,
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        });

        await seedUserDefaults(userId);
      }

      return true;
    },

    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1);

        if (dbUser[0]) {
          session.user.id = dbUser[0].id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
