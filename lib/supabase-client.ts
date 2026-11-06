import { createClient } from "@supabase/supabase-js";

// Placeholder fallbacks allow the app to boot without Supabase configured.
// Platform features will show an unconfigured state until .env.local is filled in.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true },
});
