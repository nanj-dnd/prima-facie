import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

function checkAuth(request: Request) {
  const auth = request.headers.get("authorization");
  return auth?.replace("Bearer ", "") === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notification_signups")
    .select("email, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ signups: data ?? [] });
}
