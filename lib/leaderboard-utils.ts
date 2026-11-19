// Pure helpers shared by the server (lib/leaderboard.ts) and the client leaderboard view.
// Keep this file free of server-only imports (prisma, clerk, node:crypto).

export function minutesBetween(start: Date, end: Date): number {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
}

export function formatMinutes(m: number | null): string {
  if (m === null) return "—";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
