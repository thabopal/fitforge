import Image from "next/image";
import Link from "next/link";
import type { recipes } from "@/lib/data";
type Recipe = (typeof recipes)[number];
export function RecipeCard({recipe}:{recipe:Recipe}){return <article className="card recipeCard"><Image src={recipe.image} alt={recipe.name} width={720} height={440}/><div className="cardBody"><span className="kicker">{recipe.type}</span><h3>{recipe.name}</h3><p>{recipe.reason}</p><div className="chips">{recipe.tags.map(x=><span key={x}>{x}</span>)}</div><div className="cardFooter"><b>{recipe.protein} g protein</b><span>{recipe.calories} kcal · {recipe.time} min</span></div><Link className="textLink" href={`/recipes#${recipe.slug}`}>View recipe →</Link></div></article>}
