import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { is } from "drizzle-orm";
import { PgTable, getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "./schema";
const baseline = JSON.parse(readFileSync("docs/database/production-baseline.json", "utf8")) as {
  columns: { table_name: string; column_name: string; udt_name: string; is_nullable: string; numeric_precision: number | null; numeric_scale: number | null }[];
  constraints: { conname: string; contype: string }[];
  indexes: { indexname: string }[];
};
const tables = Object.values(schema).filter(value => is(value, PgTable)).map(table => getTableConfig(table));
test("all 43 authoritative tables and every existing column retain their names, types and nullability", () => {
  assert.equal(tables.length, 43);
  const types: Record<string, string> = { int4: "integer", bool: "boolean", timestamptz: "timestamp with time zone" };
  for (const original of baseline.columns) {
    const table = tables.find(table => table.name === original.table_name);
    const column = table?.columns.find(column => column.name === original.column_name);
    assert.ok(column, `${original.table_name}.${original.column_name}`);
    const type = original.udt_name === "numeric" ? `numeric(${original.numeric_precision}, ${original.numeric_scale})` : types[original.udt_name] ?? original.udt_name;
    assert.equal(column.getSQLType(), type);
    assert.equal(column.notNull, original.is_nullable === "NO");
  }
  assert.ok(!tables.some(table => table.name === "food_logs" || table.name === "users"));
});
test("all existing foreign keys and indexes remain modeled", () => {
  const foreignKeys = tables.flatMap(table => table.foreignKeys.map(key => key.getName()));
  for (const key of baseline.constraints.filter(key => key.contype === "f")) assert.ok(foreignKeys.includes(key.conname), key.conname);
  const indexNames = tables.flatMap(table => [
    ...table.indexes.map(index => index.config.name),
    ...table.uniqueConstraints.map(unique => unique.name),
    `${table.name}_pkey`,
  ]);
  for (const index of baseline.indexes) assert.ok(indexNames.includes(index.indexname), index.indexname);
});
test("the only nutrition changes are five profile columns and two nullable UUID meal-log additions", () => {
  const before = new Set(baseline.columns.map(c => `${c.table_name}.${c.column_name}`));
  const additions = tables.flatMap(t => t.columns.map(c => `${t.name}.${c.name}`)).filter(name => !before.has(name));
  assert.deepEqual(additions.sort(), ["profiles.calorie_target_kcal", "profiles.protein_target_min_g", "profiles.protein_target_max_g", "profiles.carb_target_g", "profiles.fat_target_g", "meal_logs.food_id", "meal_logs.serving_label_snapshot"].sort());
  const foodId = tables.find(t => t.name === "meal_logs")!.columns.find(c => c.name === "food_id")!;
  assert.equal(foodId.getSQLType(), "uuid"); assert.equal(foodId.notNull, false);
});
