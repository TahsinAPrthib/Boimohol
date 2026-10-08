// Error class, plus the Prisma code when the error carries one -- enough to
// diagnose from the logs, without the message text, which for a connection
// failure names the database host. A refused connection logs as just
// "PrismaClientInitializationError"; not every failure has a code.
export function describeDbError(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { name?: string; code?: string; errorCode?: string };
    const parts = [e.name, e.code ?? e.errorCode].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
  }
  return "unknown error";
}
