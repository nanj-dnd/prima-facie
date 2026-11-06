import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  }

  // Accept a custom amount (in rupees); floor at ₹9
  let amountRupees = 9;
  try {
    const body = await request.json();
    if (typeof body.amount === "number" && body.amount >= 9) {
      amountRupees = Math.floor(body.amount);
    }
  } catch { /* body is optional */ }

  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      amount: amountRupees * 100, // convert to paise
      currency: "INR",
      receipt: `pf_${Date.now()}`,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.error?.description ?? "Order creation failed" }, { status: 502 });
  }

  const order = await res.json();
  return NextResponse.json({ orderId: order.id });
}
