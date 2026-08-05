import Link from "next/link";
import { Activity, ChefHat, Dumbbell, LayoutDashboard, Settings, TrendingUp, Utensils } from "lucide-react";
const links = [
 ["/dashboard","Dashboard",LayoutDashboard], ["/meals","Meals",Utensils], ["/recipes","Recipes",ChefHat], ["/workouts","Workouts",Dumbbell], ["/progress","Progress",TrendingUp], ["/settings","Settings",Settings]
] as const;
export function Nav(){return <aside className="sidebar"><div className="brand"><span className="brandMark"><Activity/></span><span>FitForge<small>Your fitness operating system</small></span></div><nav>{links.map(([href,label,Icon])=><Link key={href} href={href}><Icon size={19}/><span>{label}</span></Link>)}</nav><div className="momentum"><b>Week 7 momentum</b><p>Push-ups improved from 10 to 15. The forge is warming up.</p></div></aside>}
