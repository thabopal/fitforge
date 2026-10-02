import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { mealLogs, foods, profiles, user } from "@/db/schema";
import { editNutritionSnapshot, scaleNutrition, totalNutrition } from "./nutrition-totals";
import type { NutritionEntryInput } from "./nutrition-input";

// This checkout has no session authentication. Explicit single-user configuration.
export async function getNutritionUser() {
  const id = z.uuid().parse(process.env.FITFORGE_USER_ID);
  const [owner] = await db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1);
  if (!owner) throw new Error("Configured nutrition user does not exist.");
  return owner;
}
export function todayDate(timezone = "Africa/Johannesburg", now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
async function context() {
  const owner = await getNutritionUser();
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, owner.id)).limit(1);
  if (!profile) throw new Error("Configured user has no profile.");
  return { owner, profile, date: todayDate(profile.timezone) };
}
function todayOwned(ctx: Awaited<ReturnType<typeof context>>) {
  return and(eq(mealLogs.userId, ctx.owner.id), sql`(${mealLogs.loggedAt} AT TIME ZONE ${ctx.profile.timezone})::date = ${ctx.date}::date`);
}
export async function getTodayNutrition() {
  const ctx = await context();
  const [logs, catalogue] = await Promise.all([
    db.select().from(mealLogs).where(todayOwned(ctx)).orderBy(asc(mealLogs.loggedAt), asc(mealLogs.id)),
    db.select().from(foods).where(eq(foods.isActive, true)).orderBy(asc(foods.name)),
  ]);
  const foodOptions = catalogue.map(food => ({ id: food.id, name: food.name, servingLabel: `${Number(food.defaultServingQuantity)} ${food.defaultServingUnit}` }));
  const entries = logs.map(log => ({ ...log, food: { id: log.foodId ?? "", name: log.nameSnapshot, servingLabel: log.servingLabelSnapshot ?? "recorded serving" } }));
  return { date: ctx.date, profile: ctx.profile, entries, foodOptions, totals: totalNutrition(logs), incomplete: logs.some(log => [log.caloriesKcal, log.proteinG, log.carbohydrateG, log.fatG].includes(null)) };
}
export async function saveNutritionEntry(input: NutritionEntryInput) {
  const ctx = await context();
  const [existing] = input.id ? await db.select().from(mealLogs).where(and(todayOwned(ctx), eq(mealLogs.id, input.id))).limit(1) : [];
  if (input.id && !existing) throw new Error("Entry not found for today.");
  let content: Partial<typeof mealLogs.$inferInsert> = {};
  if (input.foodId) {
    const [food] = await db.select().from(foods).where(and(eq(foods.id, input.foodId), eq(foods.isActive, true))).limit(1);
    if (!food) throw new Error("Food is no longer available.");
    content = { ...scaleNutrition(food, input.servings), foodId: food.id, nameSnapshot: food.name, servingLabelSnapshot: `${Number(food.defaultServingQuantity)} ${food.defaultServingUnit}`, recipeId: null, mealPlanEntryId: null };
  } else {
    if (!existing) throw new Error("Choose a food.");
    content = await editNutritionSnapshot(existing, input.servings, async id => {
      // Inactive catalogue foods still provide the canonical source for old logs.
      const [food] = await db.select().from(foods).where(eq(foods.id, id)).limit(1);
      return food;
    });
  }
  const values = { ...content, mealType: input.mealType, servings: input.servings.toFixed(2) };
  const rows = existing
    ? await db.update(mealLogs).set(values).where(and(todayOwned(ctx), eq(mealLogs.id, existing.id))).returning({ id: mealLogs.id })
    : await db.insert(mealLogs).values({ ...values, userId: ctx.owner.id, loggedAt: new Date().toISOString(), nameSnapshot: content.nameSnapshot! }).returning({ id: mealLogs.id });
  if (!rows[0]) throw new Error("Entry no longer exists.");
  return rows[0].id;
}
export async function removeNutritionEntry(id: string) {
  const ctx = await context();
  const rows = await db.delete(mealLogs).where(and(todayOwned(ctx), eq(mealLogs.id, id))).returning({ id: mealLogs.id });
  if (!rows.length) throw new Error("Entry not found for today.");
}
