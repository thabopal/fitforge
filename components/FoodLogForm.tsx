"use client";
import { useActionState } from "react";
import { saveFoodLog, removeFoodLog } from "@/app/nutrition/actions";
import { mealLabels, mealTypes } from "@/lib/nutrition-options";

type Food = { id: string; name: string; servingLabel: string };
export function FoodLogForm({ foods, entry }: { foods: Food[]; entry?: { id: string; food: Food; mealType: typeof mealTypes[number]; servings: string } }) {
  const [state, action, pending] = useActionState(saveFoodLog, {});
  return <form action={action} className="foodLogForm">
    {entry && <input type="hidden" name="id" value={entry.id} />}
    <label>Food<select name="foodId" required={!entry} defaultValue=""><option value="" disabled={!entry}>{entry ? `Keep recorded food · ${entry.food.name}` : "Choose a food"}</option>{foods.map(food => <option key={food.id} value={food.id}>{food.name} · {food.servingLabel}</option>)}</select></label>
    <label>Meal<select name="mealType" defaultValue={entry?.mealType ?? "breakfast"}>{mealTypes.map(meal => <option key={meal} value={meal}>{mealLabels[meal]}</option>)}</select></label>
    <label>Servings<input name="servings" type="number" min="0.01" max="9999.99" step="0.01" required defaultValue={entry?.servings ?? "1"} /></label>
    <button className="primaryButton" disabled={pending || !foods.length}>{pending ? "Saving…" : entry ? "Save changes" : "Log food"}</button>
    <p role="status">{state.error ?? state.success}</p>
  </form>;
}
export function RemoveFoodLog({ id }: { id: string }) {
  const [state, action, pending] = useActionState(removeFoodLog, {});
  return <form action={action}><input type="hidden" name="id" value={id}/><button className="smallButton" disabled={pending}>{pending ? "Removing…" : "Remove"}</button><span role="status">{state.error}</span></form>;
}
