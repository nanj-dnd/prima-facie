import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase-admin";

function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const age = Number(formData.get("age"));
  const city = formData.get("city") as string;
  const gender = formData.get("gender") as string;
  const orderId = formData.get("orderId") as string;
  const paymentId = formData.get("paymentId") as string;
  const signature = formData.get("signature") as string;
  const photos = Array.from({ length: 6 }).map((_, i) => formData.get(`photo_${i}`) as File | null);
  const selfie = formData.get("selfie") as File | null;

  if (!name || !email || !age || !city || !gender) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (age < 18 || age > 28) {
    return NextResponse.json({ error: "Age must be 18–28" }, { status: 400 });
  }
  const uploadedPhotos = photos.filter(Boolean);
  if (uploadedPhotos.length < 6) {
    return NextResponse.json({ error: "All 6 photos are required" }, { status: 400 });
  }

  // Verify Razorpay payment
  if (!verifyRazorpaySignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Insert application record first to get the ID
  const { data: app, error: insertError } = await supabase
    .from("applications")
    .insert({ name, email, age, city, gender, payment_id: paymentId, order_id: orderId, status: "pending" })
    .select("id")
    .single();

  if (insertError || !app) {
    console.error("DB insert error:", insertError);
    return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
  }

  const appId = app.id;
  const bucket = "prima-facie-applications";

  // Upload all photos
  let photoUrl: string | undefined;
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    if (photo && photo.size > 0) {
      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      const ext = photo.type.includes("png") ? "png" : "jpg";
      const path = `${appId}/photo_${i}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, photoBuffer, {
        contentType: photo.type,
        upsert: true,
      });
      if (!uploadErr && i === 0) {
        // Store the main photo (first one) in the database
        photoUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      }
    }
  }

  // Upload selfie
  let selfieUrl: string | undefined;
  if (selfie && selfie.size > 0) {
    const selfieBuffer = Buffer.from(await selfie.arrayBuffer());
    const path = `${appId}/selfie.jpg`;
    const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, selfieBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (!uploadErr) {
      selfieUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    }
  }

  // Update with photo URLs
  await supabase.from("applications").update({ photo_url: photoUrl, selfie_url: selfieUrl }).eq("id", appId);

  return NextResponse.json({ success: true, id: appId });
}
