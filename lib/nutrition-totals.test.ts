import assert from "node:assert/strict";
import { test } from "node:test";
import { editNutritionSnapshot, scaleNutrition, totalNutrition } from "./nutrition-totals";
import { entrySchema } from "./nutrition-input";
const chicken = { caloriesKcal: "165.00", proteinG: "31.00", carbohydrateG: "0.00", fatG: "3.60" };
const rice = { caloriesKcal: "130.00", proteinG: "2.70", carbohydrateG: "28.00", fatG: "0.30" };
test("canonical quantity edits restore every macro on a 1 → 0.01 → 1 servings round trip", async () => {
  const food = { caloriesKcal: "152.00", proteinG: "5.10", carbohydrateG: "27.00", fatG: "3.00" };
  const original = { ...food, foodId: "11111111-1111-4111-8111-111111111111", servings: "1.00" };
  const lookup = async (id: string) => { assert.equal(id, original.foodId); return food; };
  const small = await editNutritionSnapshot(original, 0.01, lookup);
  assert.equal(small.proteinG, "0.05");
  assert.equal(scaleNutrition(small, 100).proteinG, "5.00", "old snapshot-rescaling path loses precision");
  assert.deepEqual(await editNutritionSnapshot({ ...original, ...small, servings: "0.01" }, 1, lookup), food);
});
test("meal-only edits preserve recorded macros even if canonical nutrition has changed", async () => {
  const existing = { ...chicken, foodId: "11111111-1111-4111-8111-111111111111", servings: "1.00" };
  assert.deepEqual(await editNutritionSnapshot(existing, 1, async () => { throw new Error("No quantity change"); }), chicken);
});
test("legacy edits preserve null macros, reject invalid servings and never invent canonical data", async () => {
  const legacy = { ...chicken, fatG: null, foodId: null, servings: "1.50" };
  const lookup = async () => { throw new Error("Legacy rows must not query a food"); };
  assert.deepEqual(await editNutritionSnapshot(legacy, 1.5, lookup), { ...chicken, fatG: null });
  assert.deepEqual(await editNutritionSnapshot(legacy, 0.75, lookup), scaleNutrition(legacy, 0.5));
  for (const servings of ["0", "NaN", "-1"]) await assert.rejects(editNutritionSnapshot({ ...legacy, servings }, 1, lookup));
  await assert.rejects(editNutritionSnapshot({ ...legacy, foodId: "missing" }, 1, async () => undefined), /replacement food/);
});
test("an empty diary has zero consumption", () => {
  assert.deepEqual(totalNutrition([]), { calories: 0, protein: 0, carbs: 0, fat: 0 });
});
test("fractional servings scale all four stored macro totals once", () => {
  const snapshot = scaleNutrition(chicken, 1.5);
  assert.deepEqual(snapshot, { caloriesKcal: "247.50", proteinG: "46.50", carbohydrateG: "0.00", fatG: "5.40" });
  assert.deepEqual(totalNutrition([snapshot, scaleNutrition(rice, 0.25)]), { calories: 280, protein: 47.18, carbs: 7, fat: 5.48 });
});
test("legacy snapshots contribute without food foreign keys or a second serving multiplier", () => {
  assert.deepEqual(totalNutrition([chicken, rice]), { calories: 295, protein: 33.7, carbs: 28, fat: 3.9 });
  assert.deepEqual(scaleNutrition(scaleNutrition(chicken, 1.5), 0.5 / 1.5), scaleNutrition(chicken, 0.5));
});
test("nullable historic macros remain unknown while totals include known values", () => {
  assert.equal(scaleNutrition({ ...chicken, fatG: null }, 0.5).fatG, null);
  assert.equal(totalNutrition([{ ...chicken, fatG: null }]).fat, 0);
});
test("validation requires UUIDs, known meal groups and positive two-decimal quantities", () => {
  const input = { foodId: "11111111-1111-4111-8111-111111111111", mealType: "pre_workout", servings: "1.25" };
  assert.equal(entrySchema.safeParse(input).success, true);
  for (const change of [{ foodId: "123" }, { id: "123" }, { mealType: "other" }, { servings: "0" }, { servings: "-1" }, { servings: "1.001" }]) assert.equal(entrySchema.safeParse({ ...input, ...change }).success, false);
});
test("quantities exceeding numeric snapshot capacity are rejected", () => {
  assert.throws(() => scaleNutrition(chicken, 9999.99));
});
