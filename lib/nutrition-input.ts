import { z } from "zod";
import { mealTypes } from "./nutrition-options";
export const entrySchema = z.object({
  id: z.uuid().optional(),
  foodId: z.union([z.uuid(), z.literal("")]).transform(value => value || null),
  mealType: z.enum(mealTypes),
  servings: z.coerce.number().min(0.01).max(9999.99).multipleOf(0.01),
});
export type NutritionEntryInput = z.infer<typeof entrySchema>;
