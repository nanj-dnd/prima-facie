import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Public endpoint — anyone can check whether applications are open
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("platform_settings")
    .select("applications_open")
    .eq("id", 1)
    .maybeSingle();

  if (error) return NextResponse.json({ applications_open: false });
  return NextResponse.json({ applications_open: data?.applications_open ?? false });
}
