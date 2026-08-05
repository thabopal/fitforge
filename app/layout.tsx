import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
export const metadata: Metadata={title:"FitForge",description:"Visual fitness, meal and progress tracker"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><div className="shell"><Nav/><main><header className="topbar"><div><span className="eyebrow">Personal programme</span><h1>Good evening, Thabo</h1><p>Train, eat, track and improve without turning life into a spreadsheet prison.</p></div><div className="avatar">TP</div></header>{children}<footer>Prototype content is educational, not medical advice. Production media records will include source, creator, licence and verification metadata.</footer></main></div></body></html>}
