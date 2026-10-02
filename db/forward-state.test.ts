import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { advanceColumns, assertColumns, forwardManifest, reviewedState, type ColumnState, type ForwardStep } from "./forward-state";
const baseline = JSON.parse(readFileSync("docs/database/production-baseline.json", "utf8")).columns as ColumnState[];
const nutrition = forwardManifest[0];
const next: ForwardStep = { tag: "synthetic_next", hash: "reviewed-test-hash", additions: [{
  table_name: "meal_logs", column_name: "synthetic_test_column", udt_name: "text", is_nullable: "YES",
  column_default: null, numeric_precision: null, numeric_scale: null,
}] };
test("reviewed Nutrition SQL checksum remains immutable", () => {
  const source = readFileSync(`drizzle/production/${nutrition.tag}.sql`);
  assert.equal(createHash("sha256").update(source).digest("hex"), nutrition.hash);
});
test("the next forward migration starts from post-Nutrition state, not the original baseline", () => {
  const manifest = [nutrition, next];
  const state = reviewedState(baseline, manifest, [{ tag: nutrition.tag, hash: nutrition.hash }]);
  assert.equal(state.appliedCount, 1);
  assert.equal(state.columns.length, baseline.length + 7);
  assertColumns(advanceColumns(baseline, nutrition), state.columns);
  const afterNext = advanceColumns(state.columns, next);
  const rerun = reviewedState(baseline, manifest, manifest.map(({ tag, hash }) => ({ tag, hash })));
  assert.equal(rerun.appliedCount, 2);
  assertColumns(afterNext, rerun.columns);
  assert.throws(() => assertColumns(state.columns, baseline), /reviewed forward state/);
});
test("forward ledger rejects changed hashes, unknown tags, gaps and duplicate entries", () => {
  const manifest = [nutrition, next];
  for (const ledger of [
    [{ tag: nutrition.tag, hash: "changed" }],
    [{ tag: "unknown", hash: "anything" }],
    [{ tag: next.tag, hash: next.hash }],
    [{ tag: nutrition.tag, hash: nutrition.hash }, { tag: nutrition.tag, hash: nutrition.hash }],
  ]) assert.throws(() => reviewedState(baseline, manifest, ledger));
  assert.throws(() => reviewedState(baseline, [nutrition, nutrition], []), /Duplicate manifest/);
});
test("applied state checks reject missing, unexpected, changed or duplicated live columns", () => {
  const expected = advanceColumns(baseline, nutrition);
  assertColumns([...expected].reverse(), expected);
  for (const actual of [
    expected.slice(1), [...expected, next.additions[0]], [...expected, expected[0]],
    expected.map((c, i) => i === 0 ? { ...c, column_default: "changed" } : c),
    expected.map((c, i) => i === 0 ? { ...c, is_nullable: c.is_nullable === "YES" ? "NO" : "YES" } : c),
  ]) assert.throws(() => assertColumns(actual, expected));
  assert.throws(() => advanceColumns(expected, nutrition), /Duplicate forward column/);
});
