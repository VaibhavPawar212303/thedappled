import { createHash } from "crypto";
import { unstable_cache } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { STEPS, UI_AUTOMATION } from "@/lib/assignments";
import { minutesBetween } from "@/lib/leaderboard-utils";

export { formatMinutes, minutesBetween } from "@/lib/leaderboard-utils";

export type BoardRow = {
  rank: number;
  name: string;
  done: number;
  total: number;
  completed: boolean;
  minutes: number | null;
  isYou: boolean;
};

export type Board = {
  rows: BoardRow[];
  learners: number;
  completed: number;
  inProgress: number;
  fastestMinutes: number | null;
};

type Raw = {
  userId: string;
  startedAt: Date;
  completedAt: Date | null;
  events: { name: string; createdAt: Date; verified: boolean }[];
};

type NameHints = { username?: string | null; email?: string | null };

// Keep only name-safe characters and cap the length. Returns "" if nothing usable is left.
function cleanHandle(raw: string | null | undefined): string {
  return (raw ?? "").trim().replace(/[^\p{L}\p{N}._-]/gu, "").slice(0, 24);
}

// "Asha Kulkarni" -> "Asha K.", "Asha" -> "Asha". With no first name it falls back to the Clerk
// username, then the part of the email before "@" (e.g. "vaibhav.p"), and only then to a stable
// anonymous "Learner A1B2" label.
export function formatName(
  first: string | null | undefined,
  last: string | null | undefined,
  userId: string,
  hints: NameHints = {},
): string {
  const f = (first ?? "").trim().slice(0, 24);
  const l = (last ?? "").trim();
  if (f) return l ? `${f} ${Array.from(l)[0].toUpperCase()}.` : f;

  const username = cleanHandle(hints.username);
  if (username) return username;

  const local = cleanHandle((hints.email ?? "").split("@")[0].split("+")[0]);
  if (local) return local;

  const code = createHash("sha256").update(userId).digest("hex").slice(0, 4).toUpperCase();
  return `Learner ${code}`;
}

type Ranked = { userId: string; done: number; completed: boolean; minutes: number | null };

// Completed learners first (fastest time, then earliest finish); then in-progress by checks done
// (ties: whoever reached that count first); learners with no checks yet last, by start time.
export function rankLearners(raw: Raw[]): Ranked[] {
  const total = STEPS.length;
  const ids = new Set<string>(STEPS.map((s) => s.id));
  const items = raw.map((a) => {
    const valid = a.events.filter((e) => e.verified && ids.has(e.name));
    const done = valid.length;
    const lastAt = valid.reduce((m, e) => Math.max(m, e.createdAt.getTime()), 0);
    const completed = Boolean(a.completedAt) && done >= total;
    return {
      userId: a.userId,
      done,
      completed,
      minutes: completed && a.completedAt ? minutesBetween(a.startedAt, a.completedAt) : null,
      finishedAt: a.completedAt?.getTime() ?? 0,
      lastAt,
      startedAt: a.startedAt.getTime(),
    };
  });
  items.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? -1 : 1;
    if (a.completed && b.completed) return a.minutes! - b.minutes! || a.finishedAt - b.finishedAt;
    if (a.done !== b.done) return b.done - a.done;
    if (a.done > 0) return a.lastAt - b.lastAt;
    return a.startedAt - b.startedAt;
  });
  return items.map(({ userId, done, completed, minutes }) => ({ userId, done, completed, minutes }));
}

async function namesFor(userIds: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  try {
    const client = await clerkClient();
    for (let i = 0; i < userIds.length; i += 100) {
      const chunk = userIds.slice(i, i + 100);
      const { data } = await client.users.getUserList({ userId: chunk, limit: 100 });
      for (const u of data) {
        const primary = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId) ?? u.emailAddresses[0];
        out.set(u.id, formatName(u.firstName, u.lastName, u.id, { username: u.username, email: primary?.emailAddress }));
      }
    }
  } catch {
    // Clerk unavailable: everyone falls back to the anonymous "Learner XXXX" label below.
  }
  return out;
}

// One-way key so the cached board never holds (or streams to the browser) a raw Clerk user id.
export function learnerKey(userId: string): string {
  return createHash("sha256").update(`leaderboard:${userId}`).digest("hex");
}

type CachedBoard = {
  rows: { key: string; name: string; done: number; total: number; completed: boolean; minutes: number | null }[];
};

// Rows carry a hashed key instead of the user id: it is only used to mark "you" per request.
const loadBoard = unstable_cache(
  async (): Promise<CachedBoard> => {
    const raw = await prisma.assignment.findMany({
      where: { slug: UI_AUTOMATION },
      select: { userId: true, startedAt: true, completedAt: true, events: { select: { name: true, createdAt: true, verified: true } } },
      take: 2000,
    });
    const ranked = rankLearners(raw);
    const names = await namesFor(ranked.map((r) => r.userId));
    return {
      rows: ranked.map((r) => ({
        key: learnerKey(r.userId),
        done: r.done,
        completed: r.completed,
        minutes: r.minutes,
        total: STEPS.length,
        name: names.get(r.userId) ?? formatName(null, null, r.userId),
      })),
    };
  },
  ["testing-leaderboard-ui-automation"],
  { revalidate: 30 },
);

export async function getBoard(currentUserId: string | null): Promise<Board> {
  const { rows } = await loadBoard();
  const myKey = currentUserId ? learnerKey(currentUserId) : null;
  const completed = rows.filter((r) => r.completed);
  return {
    rows: rows.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      done: r.done,
      total: r.total,
      completed: r.completed,
      minutes: r.minutes,
      isYou: myKey !== null && r.key === myKey,
    })),
    learners: rows.length,
    completed: completed.length,
    inProgress: rows.length - completed.length,
    fastestMinutes: completed.length ? completed[0].minutes : null,
  };
}

export async function getRankFor(userId: string): Promise<{ rank: number; total: number } | null> {
  const board = await getBoard(userId);
  const me = board.rows.find((r) => r.isYou);
  return me ? { rank: me.rank, total: board.learners } : null;
}
