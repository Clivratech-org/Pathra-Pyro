#!/usr/bin/env node
/**
 * Runs prisma generate after install. On corporate networks with SSL inspection,
 * set NODE_TLS_REJECT_UNAUTHORIZED=0 only for this step if generate fails.
 */
const { execSync } = require("child_process");

try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (err) {
  console.error("\n[postinstall] prisma generate failed.");
  console.error("If you see UNABLE_TO_VERIFY_LEAF_SIGNATURE, retry:");
  console.error("  set NODE_TLS_REJECT_UNAUTHORIZED=0 && npx prisma generate\n");
  process.exit(typeof err.status === "number" ? err.status : 1);
}
