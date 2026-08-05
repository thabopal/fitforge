import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({status:"ok",app:"FitForge",databaseConfigured:Boolean(process.env.DATABASE_URL)})}
