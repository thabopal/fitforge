import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
config({ path: ".env.local" });
const manifest = ["20261001_nutrition_v1"];

async function main() {
  if (["--generate", "--push"].some(flag => process.argv.includes(flag))) throw new Error("Automatic generation/push is disabled for the divergent history. Author reviewed additive SQL under drizzle/production and add it to the forward manifest.");
  const connection = process.env.DATABASE_URL_UNPOOLED || process.env.DIRECT_URL || process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
  if (!connection) throw new Error("DATABASE_URL is missing.");
  const url = new URL(connection);
  if (!url.hostname.endsWith(".neon.tech")) throw new Error("Expected the configured Neon database.");
  url.hostname = url.hostname.replace("-pooler", "");
  const sql = neon(url.toString());
  const baseline = JSON.parse(await readFile("docs/database/production-baseline.json", "utf8")) as {
    columns: { table_name: string; column_name: string; udt_name: string; is_nullable: string; column_default: string | null; numeric_precision: number | null; numeric_scale: number | null }[];
    history: Record<string, unknown>[];
  };
  const history = await sql`select * from drizzle.__drizzle_migrations order by id`;
  if (!isDeepStrictEqual(history, baseline.history)) throw new Error("Original production migration history changed. Reinspect before proceeding.");
  for (const tag of manifest) {
    const source = await readFile(`drizzle/production/${tag}.sql`, "utf8");
    const hash = createHash("sha256").update(source).digest("hex");
    const statements = source.split("--> statement-breakpoint").map(s => s.replace(/--[^\n]*/g, "").trim()).filter(Boolean);
    if (statements.some(s => !/^ALTER TABLE public\.(profiles|meal_logs)\s+ADD\b/i.test(s) || s.replace(/;\s*$/, "").includes(";") || /\b(DROP|TRUNCATE|RENAME)\b|\bALTER COLUMN\b/i.test(s))) throw new Error("Migration is not strictly additive.");
    const [ledger] = await sql`select to_regclass('fitforge_forward.migrations') as name`;
    if (ledger.name) {
      const [applied] = await sql`select hash from fitforge_forward.migrations where tag=${tag}`;
      if (applied) {
        if (applied.hash !== hash) throw new Error("An applied migration was modified.");
        console.log(`${tag}: already applied; checksum verified.`);
        continue;
      }
    }
    const columns = await sql`select table_name,column_name,udt_name,is_nullable,column_default,numeric_precision,numeric_scale from information_schema.columns where table_schema='public'`;
    if (columns.length !== baseline.columns.length || baseline.columns.some(expected => !columns.some(actual => isDeepStrictEqual(actual, Object.fromEntries(Object.keys(actual).map(key => [key, expected[key as keyof typeof expected]])))))) throw new Error("Live columns differ from the observed baseline. Reinspect; no mutation performed.");
    console.log(`${tag}: reviewed additive SQL; baseline and original history verified.`);
    if (process.argv.includes("--check")) continue;
    await sql.transaction([
      sql.query("SET LOCAL lock_timeout = '5s'"),
      sql.query("SET LOCAL statement_timeout = '30s'"),
      sql.query("SELECT pg_advisory_xact_lock(619033, 1)"),
      sql.query("CREATE SCHEMA IF NOT EXISTS fitforge_forward"),
      sql.query("CREATE TABLE IF NOT EXISTS fitforge_forward.migrations (tag text PRIMARY KEY, hash text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())"),
      ...statements.map(statement => sql.query(statement)),
      sql`insert into fitforge_forward.migrations (tag,hash) values (${tag},${hash})`,
    ]);
    console.log(`${tag}: applied atomically using the direct Neon connection.`);
  }
}
main().catch(error => {
  // Driver exceptions may carry connection credentials; never print them.
  console.error(error instanceof Error && error.name !== "NeonDbError" ? error.message : "Migration failed. No transaction changes applied. Check direct connectivity and baseline.");
  process.exitCode = 1;
});
