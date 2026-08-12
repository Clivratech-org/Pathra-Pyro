import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function storageConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.SUPABASE_STORAGE_BUCKET
  );
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!storageConfigured()) return null;
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function publicStorageUrl(rel?: string | null) {
  if (!rel || rel.startsWith("http") || rel.startsWith("/")) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const bucket =
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ||
    process.env.SUPABASE_STORAGE_BUCKET ||
    "uploads";
  if (!base) return null;
  return `${base}/storage/v1/object/public/${bucket}/${rel.replace(/^\/+/, "")}`;
}
