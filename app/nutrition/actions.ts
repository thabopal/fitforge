"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { entrySchema } from "@/lib/nutrition-input";
import { saveNutritionEntry, removeNutritionEntry } from "@/lib/nutrition";
export type ActionState = { error?: string; success?: string };
export async function saveFoodLog(_previous: ActionState, form: FormData): Promise<ActionState> {
  const parsed = entrySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Choose a food and meal, and enter 0.01–9999.99 servings with up to two decimal places." };
  try {
    await saveNutritionEntry(parsed.data);
    revalidatePath("/nutrition"); revalidatePath("/dashboard");
    return { success: parsed.data.id ? "Entry updated." : "Food logged." };
  } catch { return { error: "Could not save your entry. Check the food, servings and database connection, then refresh and try again." }; }
}
export async function removeFoodLog(_previous: ActionState, form: FormData): Promise<ActionState> {
  const id = z.uuid().safeParse(form.get("id"));
  if (!id.success) return { error: "Invalid entry." };
  try {
    await removeNutritionEntry(id.data);
    revalidatePath("/nutrition"); revalidatePath("/dashboard");
    return { success: "Entry removed." };
  } catch { return { error: "Could not remove this entry. Refresh and try again." }; }
}
