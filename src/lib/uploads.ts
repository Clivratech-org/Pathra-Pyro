import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

export async function saveUpload(file: File, folder: string) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Only JPG, PNG, WEBP, GIF or SVG images are allowed.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be under 8 MB.");
  }
  const ext = extFromType(file.type);
  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buf);
  return `${folder}/${filename}`;
}

export async function saveBuffer(buf: Buffer, folder: string, filename: string) {
  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buf);
  return `${folder}/${filename}`;
}

export async function removeUpload(rel?: string | null) {
  if (!rel) return;
  try {
    await unlink(path.join(UPLOAD_ROOT, rel));
  } catch {
    /* ignore missing files */
  }
}

function extFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/svg+xml") return "svg";
  return "jpg";
}
