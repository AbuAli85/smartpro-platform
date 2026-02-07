/**
 * Run drizzle-kit from project root and load .env from root.
 * Use: pnpm run db:push (works from any subdirectory).
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}

const rootEnv = path.join(root, ".env");
const cwdEnv = path.join(process.cwd(), ".env");
loadEnv(rootEnv);
if (!process.env.DATABASE_URL) loadEnv(cwdEnv);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for drizzle.");
  console.error("");
  console.error("Create a .env file in the project root with:");
  console.error("  DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE");
  console.error("");
  console.error("Tried loading from:");
  console.error("  " + rootEnv + "  " + (fs.existsSync(rootEnv) ? "(exists)" : "(not found)"));
  if (cwdEnv !== rootEnv) console.error("  " + cwdEnv + "  " + (fs.existsSync(cwdEnv) ? "(exists)" : "(not found)"));
  process.exit(1);
}

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run("pnpm", ["exec", "drizzle-kit", "generate"]);
run("pnpm", ["exec", "drizzle-kit", "migrate"]);
