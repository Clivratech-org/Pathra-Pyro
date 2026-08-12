export async function register() {
  const { mkdir } = await import("fs/promises");
  const { UPLOAD_ROOT } = await import("@/lib/uploads");
  await mkdir(UPLOAD_ROOT, { recursive: true }).catch(() => {});
}
