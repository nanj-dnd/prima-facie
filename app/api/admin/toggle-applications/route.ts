import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

function checkAuth(request: Request) {
  const auth = request.headers.get("authorization");
  return auth?.replace("Bearer ", "") === process.env.ADMIN_PASSWORD;
}

export async function POST(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { open } = await request.json();
  if (typeof open !== "boolean") return NextResponse.json({ error: "Missing 'open' boolean" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("platform_settings")
    .upsert({ id: 1, applications_open: open, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, applications_open: open });
}
