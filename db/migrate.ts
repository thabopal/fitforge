import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { advanceColumns, assertColumns, columnGuardSQL, forwardManifest, reviewedState, type ColumnState, type LedgerRow } from "./forward-state";
config({ path: ".env.local" });

async function main() {
  if (["--generate", "--push"].some(flag => process.argv.includes(flag))) throw new Error("Automatic generation/push is disabled for the divergent history. Author reviewed additive SQL under drizzle/production and add it to the forward manifest.");
  if (process.argv.slice(2).some(flag => flag !== "--check")) throw new Error("Unknown migration option. Only --check is supported.");
  const connection = process.env.DATABASE_URL_UNPOOLED || process.env.DIRECT_URL || process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
  if (!connection) throw new Error("DATABASE_URL is missing.");
  const url = new URL(connection);
  if (!url.hostname.endsWith(".neon.tech")) throw new Error("Expected the configured Neon database.");
  url.hostname = url.hostname.replace("-pooler", "");
  const sql = neon(url.toString());
  const baseline = JSON.parse(await readFile("docs/database/production-baseline.json", "utf8")) as {
    columns: ColumnState[]; history: Record<string, unknown>[];
  };
  // Validate every SQL file against the reviewed manifest before any writes.
  const migrations = await Promise.all(forwardManifest.map(async step => {
    const source = await readFile(`drizzle/production/${step.tag}.sql`, "utf8");
    if (createHash("sha256").update(source).digest("hex") !== step.hash) throw new Error("Migration SQL differs from its reviewed manifest checksum.");
    const statements = source.split("--> statement-breakpoint").map(s => s.replace(/--[^\n]*/g, "").trim()).filter(Boolean);
    if (!statements.length || statements.some(s => !/^ALTER TABLE public\.(profiles|meal_logs)\s+ADD\b/i.test(s) || s.replace(/;\s*$/, "").includes(";") || /\b(DROP|TRUNCATE|RENAME)\b|\bALTER COLUMN\b/i.test(s))) throw new Error("Migration is not strictly additive.");
    return { ...step, statements };
  }));
  const history = await sql`select * from drizzle.__drizzle_migrations order by id`;
  if (!isDeepStrictEqual(history, baseline.history)) throw new Error("Original production migration history changed. Reinspect before proceeding.");
  const [ledgerTable] = await sql`select to_regclass('fitforge_forward.migrations') as name`;
  const ledger = (ledgerTable.name ? await sql`select tag,hash from fitforge_forward.migrations order by tag` : []) as LedgerRow[];
  const state = reviewedState(baseline.columns, forwardManifest, ledger);
  let expected = state.columns;
  const readColumns = async () => await sql`select table_name,column_name,udt_name,is_nullable,column_default,numeric_precision,numeric_scale from information_schema.columns where table_schema='public'` as ColumnState[];
  // Applied checksums alone do not prove the current live column state.
  assertColumns(await readColumns(), expected);
  for (const step of migrations.slice(0, state.appliedCount)) console.log(`${step.tag}: already applied; checksum and live column state verified.`);
  for (const step of migrations.slice(state.appliedCount)) {
    const next = advanceColumns(expected, step);
    console.log(`${step.tag}: reviewed additive SQL; expected forward state and original history verified.`);
    // Later pending steps cannot be checked against a live state not yet reached.
    if (process.argv.includes("--check")) { console.log("Next pending migration checked only; no writes performed."); return; }
    const ledgerLiteral = JSON.stringify(ledger).replaceAll("'", "''");
    const historyLiteral = JSON.stringify(baseline.history).replaceAll("'", "''");
    await sql.transaction([
      sql.query("SET LOCAL lock_timeout = '5s'"),
      sql.query("SET LOCAL statement_timeout = '30s'"),
      sql.query("SELECT pg_advisory_xact_lock(619033, 1)"),
      sql.query("CREATE SCHEMA IF NOT EXISTS fitforge_forward"),
      sql.query("CREATE TABLE IF NOT EXISTS fitforge_forward.migrations (tag text PRIMARY KEY, hash text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())"),
      sql.query(`DO $ledger_guard$ DECLARE actual jsonb; BEGIN
        SELECT COALESCE(jsonb_agg(to_jsonb(m)), '[]'::jsonb) INTO actual FROM (SELECT tag,hash FROM fitforge_forward.migrations) m;
        IF jsonb_array_length(actual) <> jsonb_array_length('${ledgerLiteral}'::jsonb) OR NOT (actual @> '${ledgerLiteral}'::jsonb AND '${ledgerLiteral}'::jsonb @> actual) THEN RAISE EXCEPTION 'Forward ledger changed; retry after inspection'; END IF;
        SELECT COALESCE(jsonb_agg(jsonb_build_object('id', m.id, 'hash', m.hash, 'created_at', m.created_at::text) ORDER BY id), '[]'::jsonb) INTO actual FROM drizzle.__drizzle_migrations m;
        IF actual IS DISTINCT FROM '${historyLiteral}'::jsonb THEN RAISE EXCEPTION 'Original migration history changed'; END IF;
      END $ledger_guard$;`),
      sql.query(columnGuardSQL(expected)),
      ...step.statements.map(statement => sql.query(statement)),
      sql.query(columnGuardSQL(next)),
      sql`insert into fitforge_forward.migrations (tag,hash) values (${step.tag},${step.hash})`,
    ]);
    ledger.push({ tag: step.tag, hash: step.hash });
    expected = next;
    console.log(`${step.tag}: applied atomically; resulting column state verified.`);
  }
}
main().catch(error => {
  // Driver exceptions may carry connection credentials; never print them.
  console.error(error instanceof Error && error.name !== "NeonDbError" ? error.message : "Migration failed. Check direct connectivity and reviewed forward state; a failed transaction is rolled back.");
  process.exitCode = 1;
});
