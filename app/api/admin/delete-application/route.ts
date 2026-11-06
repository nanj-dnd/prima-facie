import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

function checkAuth(request: Request) {
  const auth = request.headers.get("authorization");
  const token = auth?.replace("Bearer ", "");
  return token === process.env.ADMIN_PASSWORD;
}

export async function DELETE(request: Request) {
  if (!checkAuth(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Missing application ID" }, { status: 400 });

  const supabase = createAdminClient();

  // Delete the application
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
