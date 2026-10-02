import Image from "next/image";
import Link from "next/link";
import { Droplets, Footprints, Dumbbell, Zap, type LucideIcon } from "lucide-react";
import { recipes } from "@/lib/data";
import { getTodayNutrition } from "@/lib/nutrition";
import { NutritionSummary } from "@/components/NutritionSummary";
export const dynamic = "force-dynamic";
export default async function Dashboard(){
let nutrition; try { nutrition = await getTodayNutrition(); } catch { nutrition = null; }
const protein = nutrition?.totals.protein ?? 0;
const target = nutrition?.profile.proteinTargetMinG ?? 150;
const pct = Math.min(100, Math.round(protein / target * 100));
const habitMetrics: [LucideIcon, string, string, string, number][] = [[Droplets,"Water","1.8 L","of 2.5 L",72],[Footprints,"Steps","7,420","of 10,000",74],[Zap,"Creatine","5 g","complete",100],[Dumbbell,"Push-ups","15","personal best",83]];
const meals=[recipes[2],recipes[0],recipes[3]];return <>
<section className="heroGrid"><div className="hero"><span className="eyebrow lightText">Today’s training</span><h2>Legs + Core, with enough fire to wake the stairs tomorrow.</h2><p>Six dumbbell exercises, previous targets loaded, and a simple rule: beat one number.</p><div><Link className="primaryButton lightButton" href="/workouts">Start workout</Link><Link className="secondaryButton" href="/workouts">Preview exercises</Link></div></div><div className="panel protein"><div className="row"><div><h3>Daily protein</h3><p>Target {target}–{nutrition?.profile.proteinTargetMaxG ?? 170} g</p></div><span className="status">{nutrition ? (protein >= target ? "Target reached" : "Keep logging") : "Unavailable"}</span></div><div className="proteinRing" style={{background: `radial-gradient(circle,#fff 48%,transparent 50%),conic-gradient(var(--green2) 0 ${pct}%,#edf2ee ${pct}%)`}}><b>{nutrition ? `${Math.round(protein * 100) / 100} g` : "—"}</b><span>{nutrition ? `${pct}%` : ""}</span></div><div className="bar"><i style={{width:`${pct}%`}}/></div></div></section>
{nutrition ? <NutritionSummary nutrition={nutrition}/> : <p className="note">Nutrition unavailable. Check the database connection and migration.</p>}<Link className="smallButton" href="/nutrition">Log food / view diary</Link>
<section className="metrics">{habitMetrics.map(([Icon,label,value,note,pct])=><article className="metric" key={label}><div className="row"><span>{label}</span><span className="metricIcon"><Icon size={19}/></span></div><strong>{value}</strong><small>{note}</small><div className="bar"><i style={{width:`${pct}%`}}/></div></article>)}</section>
<section className="contentGrid"><div className="panel"><div className="row"><div><h3>Meal ideas</h3><p>Plan suggestions · log foods separately</p></div><Link className="smallButton" href="/meals">Full plan</Link></div><div className="mealList">{meals.map((r)=><div className="mealRow" key={r.slug}><Image src={r.image} alt={r.name} width={110} height={80}/><div><h4>{r.name}</h4><p>{r.type} · {r.calories} kcal</p><span className="status">{r.protein} g protein</span></div><Link className="smallButton" href="/nutrition">Log food</Link></div>)}</div></div><div className="panel coaching"><h3>Quick coaching</h3><p>Your dumbbells feel easier. Increase clean repetitions first, then add weight.</p><div className="note"><b>Evening training</b><p>Creatine is fine after 18:00. High-caffeine pre-workout is the more likely sleep burglar.</p></div><div className="note"><b>Today’s finish line</b><p>Complete the workout, drink 700 ml more water and reach at least {target} g protein.</p></div></div></section></>}
