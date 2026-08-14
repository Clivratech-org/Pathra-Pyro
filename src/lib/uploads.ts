import { getSupabaseAdmin, storageConfigured } from "@/lib/storage";

export const UPLOAD_ROOT = `${process.cwd()}/uploads`;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

export function useLocalStorage() {
  return !storageConfigured();
}

export async function saveUpload(file: File, folder: string) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Only JPG, PNG, WEBP, GIF or SVG images are allowed.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8 MB.");
  }
  const ext = extFromType(file.type);
  const filename = `${Date.now()}-${randomId()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  return saveBuffer(buf, folder, filename, file.type);
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
    const bucket = process.env.SUPABASE_STORAGE_BUCKET!;
    const { error } = await supabase.storage.from(bucket).upload(rel, buf, {
      contentType,
      upsert: false,
    });
    if (error) {
      const bucketMissing =
        error.message === "Bucket not found" || error.message.includes("Bucket not found");
      if (!bucketMissing) throw new Error(error.message);
      console.warn(
        `Supabase bucket "${bucket}" not found — saving to local uploads/. Create a public "${bucket}" bucket in Supabase Storage, then re-run seed.`
      );
    } else {
      return rel;
    }
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
    const bucket = process.env.SUPABASE_STORAGE_BUCKET!;
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
