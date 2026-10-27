// Keeps Prisma away from the real databases.
//
// A shadow database is one Prisma wipes before every use: `migrate dev`
// replays the migrations into it, and so does `migrate diff
// --from-migrations`, which takes it from --shadow-database-url. Pointed at
// a real database, the first thing either does is empty it (2026-10-27:
// the dev database, by a --shadow-database-url copied from .env).
//
//   node scripts/prisma-guard.mjs --check-shadow
//       Run by `npm run prisma:migrate` before `prisma migrate dev`. Passes
//       only when SHADOW_DATABASE_URL (the environment, else .env) names a
//       database whose name contains "shadow", on a different server from
//       DATABASE_URL and DIRECT_URL. Dev's and production's databases are
//       both "neondb", so neither can pass.
//
//   node scripts/prisma-guard.mjs --hook
//       A Claude Code PreToolUse hook (.claude/settings.json): reads the
//       Bash or PowerShell command on stdin and refuses, with exit code 2,
//       anything that resets, pushes over or replays into a database, and
//       any command that carries a database URL of its own. Migrations are
//       written with `npm run db:diff`, which only reads the dev schema, and
//       applied with `prisma migrate deploy`.
import { readFileSync } from "node:fs";

const RULES = [
  [/--shadow-database-url|\bSHADOW_DATABASE_URL\s*=/i, "names a shadow database on the command line; Prisma wipes a shadow database first. Use `npm run prisma:migrate`, which checks it."],
  [/--(from|to)-migrations\b/i, "replays the migrations into a shadow database, which Prisma wipes first. Use `npm run db:diff` (reads the dev schema only)."],
  [/\bprisma\s+migrate\s+(reset|dev|resolve)\b/i, "can reset the database or rewrite its migration history. Write the SQL with `npm run db:diff` and apply it with `prisma migrate deploy`; `npm run prisma:migrate` checks its shadow database first."],
  [/\bprisma\s+db\s+push\b|--force-reset\b|--accept-data-loss\b/i, "can drop tables or data; this project changes the schema only through migrations."],
  [/postgres(ql)?:\/\/(?![^@\s"']*@?(localhost|127\.0\.0\.1)[:/])[^\s"']+/i, "contains a database URL. Database URLs come only from .env, which points at dev."],
];

function blockedReason(command) {
  for (const [re, why] of RULES) if (re.test(command)) return why;
  return null;
}

function envFile() {
  try {
    const out = {};
    for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
    }
    return out;
  } catch {
    return {};
  }
}

// "ep-x-pooler.region.aws.neon.tech" and "ep-x.region.aws.neon.tech" are the same server.
function server(url) {
  const u = new URL(url);
  return `${u.hostname.replace(/-pooler(?=\.)/, "")}:${u.port || "5432"}`;
}

function checkShadow() {
  const env = { ...envFile(), ...process.env };
  const fail = (why) => {
    console.error(`prisma-guard: refusing to run with this shadow database: ${why}`);
    console.error("Set SHADOW_DATABASE_URL to a throwaway database (its name containing \"shadow\") on another server, e.g. a local Postgres.");
    process.exit(1);
  };
  if (!env.SHADOW_DATABASE_URL) fail("SHADOW_DATABASE_URL is not set.");
  let shadow;
  try {
    shadow = new URL(env.SHADOW_DATABASE_URL);
  } catch {
    fail("SHADOW_DATABASE_URL is not a URL.");
  }
  const name = decodeURIComponent(shadow.pathname.replace(/^\//, ""));
  if (!/shadow/i.test(name)) fail(`its database is "${name}"; a shadow database's name must contain "shadow".`);
  for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
    if (env[key] && server(env[key]) === server(shadow.href)) fail(`it is on the same server as ${key}.`);
  }
  console.log(`prisma-guard: shadow database "${name}" on ${shadow.hostname} is separate from the app's database.`);
}

if (process.argv.includes("--check-shadow")) {
  checkShadow();
} else if (process.argv.includes("--hook")) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => (input += chunk));
  process.stdin.on("end", () => {
    let command = "";
    try {
      command = String(JSON.parse(input)?.tool_input?.command ?? "");
    } catch {
      process.exit(0);
    }
    const why = blockedReason(command);
    if (why) {
      console.error(`Blocked by scripts/prisma-guard.mjs: this command ${why}`);
      process.exit(2);
    }
    process.exit(0);
  });
} else {
  console.error("usage: node scripts/prisma-guard.mjs --check-shadow | --hook");
  process.exit(1);
}
