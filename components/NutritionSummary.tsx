import type { getTodayNutrition } from "@/lib/nutrition";
export function NutritionSummary({ nutrition }: { nutrition: Awaited<ReturnType<typeof getTodayNutrition>> }) {
  const { profile, totals } = nutrition;
  const metrics = [
    { label: "Calories", value: totals.calories, target: profile.calorieTargetKcal, targetLabel: `${profile.calorieTargetKcal}`, unit: "kcal" },
    { label: "Protein", value: totals.protein, target: profile.proteinTargetMinG, targetLabel: `${profile.proteinTargetMinG}–${profile.proteinTargetMaxG}`, unit: "g" },
    { label: "Carbs", value: totals.carbs, target: profile.carbTargetG, targetLabel: `${profile.carbTargetG}`, unit: "g" },
    { label: "Fat", value: totals.fat, target: profile.fatTargetG, targetLabel: `${profile.fatTargetG}`, unit: "g" },
  ];
  return <section className="metrics" aria-label="Today's nutrition">{metrics.map(metric => <article className="metric" key={metric.label}><b>{metric.label}</b><strong>{Math.round(metric.value * 100) / 100} {metric.unit}</strong><small>consumed / {metric.targetLabel} {metric.unit} target</small><div className="bar"><i style={{ width: `${Math.min(100, metric.value / metric.target * 100)}%` }}/></div><p>{Math.round(Math.max(0, metric.target - metric.value) * 100) / 100} {metric.unit} remaining{metric.label === "Protein" ? " to minimum" : ""}</p>{metric.value > (metric.label === "Protein" ? profile.proteinTargetMaxG : metric.target) && <small>Above target</small>}</article>)}</section>;
}
