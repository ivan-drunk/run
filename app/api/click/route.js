import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  const { error } = await supabase.rpc("increment_clicks");

  if (error) {
    console.error("Increment error:", error);
    return NextResponse.json({ error: "Failed to increment" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}