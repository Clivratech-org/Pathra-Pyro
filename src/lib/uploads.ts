import { getSupabaseAdmin, storageConfigured } from "@/lib/storage";

export const UPLOAD_ROOT = `${process.cwd()}/uploads`;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

export function useLocalStorage() {
  return !storageConfigured();
}

function sniffType(file: File): string {
  if (file.type && ALLOWED.has(file.type)) return file.type;
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".svg")) return "image/svg+xml";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return file.type || "";
}

export async function saveUpload(file: File, folder: string) {
  const contentType = sniffType(file);
  if (!ALLOWED.has(contentType)) {
    throw new Error("Only JPG, PNG, WEBP, GIF or SVG images are allowed.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8 MB.");
  }
  const ext = extFromType(contentType);
  const filename = `${Date.now()}-${randomId()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  return saveBuffer(buf, folder, filename, contentType);
}

async function ensurePublicBucket(bucket: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { data } = await supabase.storage.getBucket(bucket);
  if (data) return true;
  const { error } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
  });
  if (error && !/already exists/i.test(error.message)) {
    console.warn("Could not create storage bucket:", error.message);
    return false;
  }
  return true;
}

export async function saveBuffer(
  buf: Buffer,
  folder: string,
  filename: string,
  contentType = "image/jpeg"
) {
  const rel = `${folder}/${filename}`;
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
    let { error } = await supabase.storage.from(bucket).upload(rel, buf, {
      contentType,
      upsert: true,
    });
    if (error && /bucket not found/i.test(error.message)) {
      const ok = await ensurePublicBucket(bucket);
      if (ok) {
        ({ error } = await supabase.storage.from(bucket).upload(rel, buf, {
          contentType,
          upsert: true,
        }));
      }
    }
    if (error) throw new Error(`Image upload failed: ${error.message}`);
    return rel;
  }

  const { mkdir, writeFile } = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buf);
  return rel;
}

export async function removeUpload(rel?: string | null) {
  if (!rel || rel.startsWith("http")) return;
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
    await supabase.storage.from(bucket).remove([rel.replace(/^\/+/, "")]).catch(() => {});
    return;
  }
  const { unlink } = await import("fs/promises");
  const path = await import("path");
  try {
    await unlink(path.join(UPLOAD_ROOT, rel));
  } catch {
    /* ignore missing files */
  }
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function extFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/svg+xml") return "svg";
  return "jpg";
}
