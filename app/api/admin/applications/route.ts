import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

function checkAuth(request: Request) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const supabase = createAdminClient();
  let query = supabase
    .from("applications")
    .select("id, name, email, age, city, gender, photo_url, selfie_url, status, payment_id, created_at")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ applications: data });
}
