export type MacroSnapshot = { caloriesKcal: string | null; proteinG: string | null; carbohydrateG: string | null; fatG: string | null };
// meal_logs stores consumed macro totals, already scaled to the logged servings.
export function totalNutrition(entries: MacroSnapshot[]) {
  const cents = entries.reduce((total, entry) => ({
    calories: total.calories + Math.round(Number(entry.caloriesKcal ?? 0) * 100),
    protein: total.protein + Math.round(Number(entry.proteinG ?? 0) * 100),
    carbs: total.carbs + Math.round(Number(entry.carbohydrateG ?? 0) * 100),
    fat: total.fat + Math.round(Number(entry.fatG ?? 0) * 100),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  return { calories: cents.calories / 100, protein: cents.protein / 100, carbs: cents.carbs / 100, fat: cents.fat / 100 };
}
export function scaleNutrition(food: MacroSnapshot, multiplier: number) {
  const scaled = (value: string | null) => {
    if (value === null) return null;
    const result = Number(value) * multiplier;
    if (!Number.isFinite(result) || result < 0 || result > 999999.99) throw new Error("Nutrition exceeds the supported quantity. Use fewer servings.");
    return (Math.round(Math.round(Number(value) * 100) * multiplier + Number.EPSILON) / 100).toFixed(2);
  };
  return { caloriesKcal: scaled(food.caloriesKcal), proteinG: scaled(food.proteinG), carbohydrateG: scaled(food.carbohydrateG), fatG: scaled(food.fatG) };
}
