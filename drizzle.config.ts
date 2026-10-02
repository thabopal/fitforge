import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing. Add it to .env.local before running Drizzle commands."
  );
}

// Legacy drizzle-kit migrate must not replay the incompatible local history.
// Production migrations use db/migrate.ts and the separate forward ledger.
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle/production/generated",
  dialect: "postgresql",
  migrations: { schema: "fitforge_forward", table: "drizzle_generated_migrations" },
  dbCredentials: {
    url: process.env.DATABASE_URL.replace("-pooler.", "."),
  },
});