import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Cache the client across serverless function invocations to avoid
// exhausting the Supabase connection pool (transaction mode, port 6543).
const globalForDb = globalThis as unknown as { queryClient: postgres.Sql };

const queryClient =
  globalForDb.queryClient ??
  postgres(process.env.DATABASE_URL!, {
    max: 5,           // Max connections per serverless instance
    idle_timeout: 20, // Close idle connections after 20s
    prepare: false,   // Required for Supabase transaction-mode pooler
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.queryClient = queryClient;
}

export const db = drizzle(queryClient, { schema });
export type DB = typeof db;
