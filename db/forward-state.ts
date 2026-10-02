import { isDeepStrictEqual } from "node:util";

export type ColumnState = {
  table_name: string; column_name: string; udt_name: string; is_nullable: string;
  column_default: string | null; numeric_precision: number | null; numeric_scale: number | null;
};
export type ForwardStep = { tag: string; hash: string; additions: ColumnState[] };
export type LedgerRow = { tag: string; hash: string };
const fields = ["table_name", "column_name", "udt_name", "is_nullable", "column_default", "numeric_precision", "numeric_scale"] as const;
export function normalizeColumns(columns: ColumnState[]): ColumnState[] {
  return columns.map(column => Object.fromEntries(fields.map(key => [key, column[key]])) as ColumnState)
    .sort((a, b) => `${a.table_name}.${a.column_name}` < `${b.table_name}.${b.column_name}` ? -1 : 1);
}
export function assertColumns(actual: ColumnState[], expected: ColumnState[]) {
  if (!isDeepStrictEqual(normalizeColumns(actual), normalizeColumns(expected))) throw new Error("Live columns differ from the reviewed forward state. Reinspect; no migration performed.");
}
export function advanceColumns(columns: ColumnState[], step: ForwardStep) {
  const names = new Set(columns.map(c => `${c.table_name}.${c.column_name}`));
  for (const c of step.additions) {
    const name = `${c.table_name}.${c.column_name}`;
    if (names.has(name)) throw new Error(`Duplicate forward column: ${name}`);
    names.add(name);
  }
  return normalizeColumns([...columns, ...step.additions]);
}
export function reviewedState(baseline: ColumnState[], manifest: ForwardStep[], ledger: LedgerRow[]) {
  if (new Set(manifest.map(s => s.tag)).size !== manifest.length) throw new Error("Duplicate manifest tags.");
  if (new Set(ledger.map(s => s.tag)).size !== ledger.length) throw new Error("Duplicate ledger tags.");
  if (ledger.some(row => !manifest.some(step => step.tag === row.tag))) throw new Error("Unknown forward migration. Reinspect before proceeding.");
  let columns = normalizeColumns(baseline);
  let appliedCount = 0;
  let pending = false;
  for (const step of manifest) {
    const applied = ledger.find(row => row.tag === step.tag);
    if (!applied) { pending = true; continue; }
    if (pending) throw new Error("Forward ledger is not an applied manifest prefix.");
    if (applied.hash !== step.hash) throw new Error("An applied migration was modified.");
    columns = advanceColumns(columns, step);
    appliedCount++;
  }
  return { columns, appliedCount };
}

// Exact column metadata is checked inside the advisory-locked transaction,
// before DDL and again before committing its ledger record.
export function columnGuardSQL(expected: ColumnState[]) {
  const literal = JSON.stringify(normalizeColumns(expected)).replaceAll("'", "''");
  return `DO $forward_guard$
DECLARE actual jsonb; expected jsonb := '${literal}'::jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(to_jsonb(c)), '[]'::jsonb) INTO actual FROM
    (SELECT table_name,column_name,udt_name,is_nullable,column_default,numeric_precision,numeric_scale
     FROM information_schema.columns WHERE table_schema='public') c;
  IF jsonb_array_length(actual) <> jsonb_array_length(expected)
     OR NOT (actual @> expected AND expected @> actual) THEN
    RAISE EXCEPTION 'Live columns differ from reviewed forward state';
  END IF;
END $forward_guard$;`;
}
const profileTarget = (column_name: string, value: number): ColumnState => ({
  table_name: "profiles", column_name, udt_name: "int4", is_nullable: "NO",
  column_default: String(value), numeric_precision: 32, numeric_scale: 0,
});
// Future steps pin reviewed SQL checksums and exact column additions. Never
// replace the original baseline or rewrite an applied step.
export const forwardManifest: ForwardStep[] = [{
  tag: "20261001_nutrition_v1",
  hash: "b4a6990b9fb4ba632121a6ffe8fe879376e1933ebc948fc9e79b3dbd33f48b0d",
  additions: [
    profileTarget("calorie_target_kcal", 2100), profileTarget("protein_target_min_g", 150),
    profileTarget("protein_target_max_g", 170), profileTarget("carb_target_g", 210), profileTarget("fat_target_g", 70),
    { table_name: "meal_logs", column_name: "food_id", udt_name: "uuid", is_nullable: "YES", column_default: null, numeric_precision: null, numeric_scale: null },
    { table_name: "meal_logs", column_name: "serving_label_snapshot", udt_name: "text", is_nullable: "YES", column_default: null, numeric_precision: null, numeric_scale: null },
  ],
}];
