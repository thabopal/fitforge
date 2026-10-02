import { FoodLogForm, RemoveFoodLog } from "@/components/FoodLogForm";
import { NutritionSummary } from "@/components/NutritionSummary";
import { getTodayNutrition } from "@/lib/nutrition";
import { mealLabels, mealTypes } from "@/lib/nutrition-options";
export const dynamic = "force-dynamic";
export default async function Nutrition() {
  let nutrition;
  try { nutrition = await getTodayNutrition(); } catch { return <section className="panel"><h2>Nutrition is unavailable</h2><p>Check the database connection and nutrition user configuration, then refresh.</p></section>; }
  return <><div className="pageHead"><div><span className="eyebrow">Today · {nutrition.date}</span><h2>Fuel your progress</h2><p>Log what you eat. Each serving uses the portion shown beside the food.</p></div></div>
    <NutritionSummary nutrition={nutrition}/>{nutrition.incomplete && <p className="note">Some recorded entries have missing nutrition values. Totals include known values only.</p>}
    <section className="panel"><h3>Log a food</h3>{!nutrition.foodOptions.length && <p>No foods available. Seed the food catalogue first.</p>}<FoodLogForm foods={nutrition.foodOptions}/></section>
    <h2 className="sectionTitle">Today’s food diary</h2><div className="weekGrid">{mealTypes.map(meal => <section className="panel" key={meal}><h3>{mealLabels[meal]}</h3>{nutrition.entries.filter(entry => entry.mealType === meal).map(entry => <article className="note" key={entry.id}><b>{entry.food.name}</b><p>{Number(entry.servings)} × {entry.food.servingLabel}</p><p>{Math.round(Number(entry.caloriesKcal ?? 0))} kcal · {Math.round(Number(entry.proteinG ?? 0) * 100) / 100} g protein</p><details><summary>Edit entry</summary><FoodLogForm foods={nutrition.foodOptions} entry={entry}/></details><RemoveFoodLog id={entry.id}/></article>)}{!nutrition.entries.some(entry => entry.mealType === meal) && <p>No foods logged yet.</p>}</section>)}</div></>;
}
