import { createHash } from "crypto";
import { unstable_cache } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { AUTOMATION_SLUGS, automationSlugsFor, countsOnBoard, MANUAL_TESTING, stepsFor, toolKeyFor, UI_AUTOMATION, type AssignmentSlug } from "@/lib/assignments";
import { minutesBetween } from "@/lib/leaderboard-utils";
import { DEFAULT_TOOL, NO_TOOL, type Tool } from "@/lib/tools";

export { formatMinutes, minutesBetween } from "@/lib/leaderboard-utils";

// Cache tag on every board (stage boards + All tracks). Expire it when a learner's progress changes
// so the change shows on the next load instead of waiting for the timed refresh.
export const LEADERBOARD_TAG = "testing-leaderboard";

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
  events: { name: string; createdAt: Date; verified: boolean; signals?: unknown }[];
};

type NameHints = { username?: string | null; email?: string | null };

// Keep only name-safe characters and cap the length. Returns "" if nothing usable is left.
function cleanHandle(raw: string | null | undefined): string {
  return (raw ?? "").trim().replace(/[^\p{L}\p{N}._-]/gu, "").slice(0, 24);
}

const capFirst = (w: string) => {
  const [first, ...rest] = Array.from(w);
  return first ? first.toLocaleUpperCase() + rest.join("") : "";
};

// Turns a username / email prefix into something readable: "himani" -> "Himani",
// "HIMANI" -> "Himani", "vaibhav.pawar" -> "Vaibhav Pawar", "asha_k" -> "Asha K".
function prettyHandle(raw: string | null | undefined): string {
  return cleanHandle(raw)
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => capFirst(w === w.toLocaleUpperCase() && w !== w.toLocaleLowerCase() ? w.toLocaleLowerCase() : w))
    .join(" ");
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
  const f = capFirst((first ?? "").trim().slice(0, 24));
  const l = (last ?? "").trim();
  if (f) return l ? `${f} ${Array.from(l)[0].toUpperCase()}.` : f;

  const username = prettyHandle(hints.username);
  if (username) return username;

  const local = prettyHandle((hints.email ?? "").split("@")[0].split("+")[0]);
  if (local) return local;

  const code = createHash("sha256").update(userId).digest("hex").slice(0, 4).toUpperCase();
  return `Learner ${code}`;
}

type Ranked = { userId: string; done: number; completed: boolean; minutes: number | null };

// Completed learners first (fastest time, then earliest finish); then in-progress by checks done
// (ties: whoever reached that count first); learners with no checks yet last, by start time.
export function rankLearners(raw: Raw[], slug: string = UI_AUTOMATION): Ranked[] {
  const steps = stepsFor(slug);
  const total = steps.length;
  const ids = new Set<string>(steps.map((s) => s.id));
  const items = raw.map((a) => {
    const valid = a.events.filter((e) => countsOnBoard(e) && ids.has(e.name));
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

// Last good name per learner on this server instance: used if a later Clerk lookup fails.
const lastGoodNames = new Map<string, string>();

// Looks learners up in Clerk. It THROWS on any Clerk error on purpose, so that a failed lookup is
// never stored in a cache (a cached failure would show "Learner XXXX" to everyone until it expired).
async function fetchNames(userIds: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  const client = await clerkClient();
  for (let i = 0; i < userIds.length; i += 100) {
    const chunk = userIds.slice(i, i + 100);
    const { data } = await client.users.getUserList({ userId: chunk, limit: 100 });
    for (const u of data) {
      const primary = u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId) ?? u.emailAddresses[0];
      out[u.id] = formatName(u.firstName, u.lastName, u.id, { username: u.username, email: primary?.emailAddress });
    }
  }
  return out;
}

// Clerk's list call is two requests under the hood (the list and a count), so retry once on a
// transient failure before giving up.
async function fetchNamesWithRetry(userIds: string[]): Promise<Record<string, string>> {
  try {
    return await fetchNames(userIds);
  } catch {
    await new Promise((r) => setTimeout(r, 300));
    return fetchNames(userIds);
  }
}

// Names change rarely, so successful lookups are cached for 10 minutes (separately from the board).
const cachedNames = unstable_cache(fetchNamesWithRetry, ["leaderboard-names"], { revalidate: 600 });

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

// strict = true: rethrow on failure (so the caller does not cache a board built without names).
async function resolveNames(userIds: string[], strict: boolean): Promise<Map<string, string>> {
  try {
    const names = await withTimeout(cachedNames([...userIds].sort()), 5000);
    for (const [id, name] of Object.entries(names)) lastGoodNames.set(id, name);
    return new Map(Object.entries(names));
  } catch (e) {
    console.error("[leaderboard] Clerk name lookup failed:", e instanceof Error ? e.message : e);
    if (strict) throw e;
    return new Map(userIds.filter((id) => lastGoodNames.has(id)).map((id) => [id, lastGoodNames.get(id)!]));
  }
}

// One-way key so the cached board never holds (or streams to the browser) a raw Clerk user id.
export function learnerKey(userId: string): string {
  return createHash("sha256").update(`leaderboard:${userId}`).digest("hex");
}

type CachedBoard = {
  rows: { key: string; name: string; done: number; total: number; completed: boolean; minutes: number | null }[];
};

// A stage board ranks only the learners on one tool (Manual testing has a single board).
async function buildBoard(slug: AssignmentSlug, tool: Tool, strict: boolean): Promise<CachedBoard> {
  const raw = await prisma.assignment.findMany({
    where: { slug, tool: toolKeyFor(slug, tool) },
    select: { userId: true, startedAt: true, completedAt: true, events: { select: { name: true, createdAt: true, verified: true, signals: true } } },
    take: 2000,
  });
  const ranked = rankLearners(raw, slug);
  const names = await resolveNames(ranked.map((r) => r.userId), strict);
  // Rows carry a hashed key instead of the user id: it is only used to mark "you" per request.
  return {
    rows: ranked.map((r) => ({
      key: learnerKey(r.userId),
      done: r.done,
      completed: r.completed,
      minutes: r.minutes,
      total: stepsFor(slug).length,
      name: names.get(r.userId) ?? formatName(null, null, r.userId),
    })),
  };
}

// Cached for 30s. If the name lookup fails this throws, so nothing is cached and an older cached
// board (with real names) keeps being served until a lookup succeeds again.
const loaders = new Map<string, () => Promise<CachedBoard>>();
function loadBoard(slug: AssignmentSlug, tool: Tool) {
  const key = `${slug}:${toolKeyFor(slug, tool)}`;
  let load = loaders.get(key);
  if (!load) {
    load = unstable_cache(() => buildBoard(slug, tool, true), [`testing-leaderboard-${key}`], { revalidate: 30, tags: [LEADERBOARD_TAG] });
    loaders.set(key, load);
  }
  return load();
}

export async function getBoard(currentUserId: string | null, slug: AssignmentSlug = UI_AUTOMATION, tool: Tool = DEFAULT_TOOL): Promise<Board> {
  let rows: CachedBoard["rows"];
  try {
    ({ rows } = await loadBoard(slug, tool));
  } catch {
    // Name lookup failed and there is no cached board yet: show the ranking with whatever names we
    // know, without caching it, so the next request tries Clerk again.
    ({ rows } = await buildBoard(slug, tool, false));
  }
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

// ---- All tracks board ------------------------------------------------------------------------
// One board per tool. A row per learner who has started that tool: Manual testing (4 steps) + the
// Automation stages on that tool (stage 5 is Playwright only). Ranked by total verified checks, then by who got there first.

export const STAGE_LABEL: Record<AssignmentSlug, string> = {
  [MANUAL_TESTING]: "Manual testing",
  "ui-automation": "UI automation",
  "framework-setup": "Framework setup",
  "page-objects": "Page objects",
  "cross-browser": "Cross-browser",
  annotations: "Annotations",
};

// The most checks a learner can verify on a tool's board: Manual testing plus that tool's automation
// stages (the Playwright-only stage 5 is not on the Cypress board).
export const allTracksMax = (tool: Tool) => [MANUAL_TESTING, ...automationSlugsFor(tool)].reduce((n, s) => n + stepsFor(s).length, 0);

type StageProgress = { slug: AssignmentSlug; done: number; total: number; complete: boolean };

export type AllTracksRow = {
  rank: number;
  name: string;
  total: number;
  max: number;
  manual: { started: boolean; done: number; total: number; complete: boolean };
  automation: { started: boolean; stagesDone: number; stages: number };
  current: (StageProgress & { label: string }) | null; // the stage of the learner's latest passed check
  allDone: boolean;
  isYou: boolean;
};

export type AllTracksBoard = {
  rows: AllTracksRow[];
  learners: number;
  finishedAll: number;
  checksVerified: number;
  mostChecks: number;
  max: number;
};

type CachedAllRow = Omit<AllTracksRow, "rank" | "isYou"> & { key: string };

type RawAssignment = Raw & { slug: string };
type Acc = { userId: string; total: number; firstStart: number; lastAt: number; stages: Map<string, StageProgress>; current: StageProgress | null; currentAt: number };

// Pure: combines each learner's assignments across all tracks and ranks them (no names, no I/O).
export function rankAllTracks(raw: RawAssignment[]): Acc[] {
  const byUser = new Map<string, Acc>();
  for (const a of raw) {
    const slug = a.slug as AssignmentSlug;
    const steps = stepsFor(slug);
    const ids = new Set<string>(steps.map((s) => s.id));
    const valid = a.events.filter((e) => countsOnBoard(e) && ids.has(e.name));
    const done = valid.length;
    const last = valid.reduce((m, e) => Math.max(m, e.createdAt.getTime()), 0);
    const progress: StageProgress = { slug, done, total: steps.length, complete: Boolean(a.completedAt) && done >= steps.length };

    let u = byUser.get(a.userId);
    if (!u) {
      u = { userId: a.userId, total: 0, firstStart: a.startedAt.getTime(), lastAt: 0, stages: new Map(), current: null, currentAt: 0 };
      byUser.set(a.userId, u);
    }
    u.total += done;
    u.firstStart = Math.min(u.firstStart, a.startedAt.getTime());
    u.lastAt = Math.max(u.lastAt, last);
    u.stages.set(slug, progress);
    if (done > 0 && last >= u.currentAt) {
      u.current = progress;
      u.currentAt = last;
    }
  }

  return [...byUser.values()].sort((x, y) => {
    if (x.total !== y.total) return y.total - x.total;
    if (x.total > 0) return x.lastAt - y.lastAt;
    return x.firstStart - y.firstStart;
  });
}

async function buildAllTracks(tool: Tool, strict: boolean): Promise<{ rows: CachedAllRow[] }> {
  const all = await prisma.assignment.findMany({
    where: { OR: [{ slug: MANUAL_TESTING, tool: NO_TOOL }, { slug: { in: [...AUTOMATION_SLUGS] }, tool }] },
    select: { userId: true, slug: true, tool: true, startedAt: true, completedAt: true, events: { select: { name: true, createdAt: true, verified: true, signals: true } } },
    take: 8000,
  });
  // Only learners who have started this tool are compared on its board.
  const onTool = new Set(all.filter((a) => a.tool === tool).map((a) => a.userId));
  const raw = all.filter((a) => onTool.has(a.userId));
  const ranked = rankAllTracks(raw);
  const names = await resolveNames(ranked.map((r) => r.userId), strict);

  return {
    rows: ranked.map((u) => {
      const m = u.stages.get(MANUAL_TESTING);
      const autos = automationSlugsFor(tool).map((s) => u.stages.get(s)).filter((p): p is StageProgress => Boolean(p));
      return {
        key: learnerKey(u.userId),
        name: names.get(u.userId) ?? formatName(null, null, u.userId),
        total: u.total,
        max: allTracksMax(tool),
        manual: { started: Boolean(m), done: m?.done ?? 0, total: stepsFor(MANUAL_TESTING).length, complete: Boolean(m?.complete) },
        automation: { started: autos.length > 0, stagesDone: autos.filter((p) => p.complete).length, stages: automationSlugsFor(tool).length },
        current: u.current ? { ...u.current, label: STAGE_LABEL[u.current.slug] } : null,
        allDone: u.total >= allTracksMax(tool),
      };
    }),
  };
}

const allTracksLoaders = new Map<Tool, () => Promise<{ rows: CachedAllRow[] }>>();
function loadAllTracks(tool: Tool) {
  let load = allTracksLoaders.get(tool);
  if (!load) {
    load = unstable_cache(() => buildAllTracks(tool, true), [`testing-leaderboard-all-tracks-${tool}`], { revalidate: 30, tags: [LEADERBOARD_TAG] });
    allTracksLoaders.set(tool, load);
  }
  return load();
}

export async function getAllTracksBoard(currentUserId: string | null, tool: Tool = DEFAULT_TOOL): Promise<AllTracksBoard> {
  let rows: CachedAllRow[];
  try {
    ({ rows } = await loadAllTracks(tool));
  } catch {
    ({ rows } = await buildAllTracks(tool, false));
  }
  const myKey = currentUserId ? learnerKey(currentUserId) : null;
  return {
    rows: rows.map(({ key, ...r }, i) => ({ ...r, rank: i + 1, isYou: myKey !== null && key === myKey })),
    learners: rows.length,
    finishedAll: rows.filter((r) => r.allDone).length,
    checksVerified: rows.reduce((n, r) => n + r.total, 0),
    mostChecks: rows[0]?.total ?? 0,
    max: allTracksMax(tool),
  };
}

export async function getRankFor(userId: string, slug: AssignmentSlug = UI_AUTOMATION, tool: Tool = DEFAULT_TOOL): Promise<{ rank: number; total: number } | null> {
  const board = await getBoard(userId, slug, tool);
  const me = board.rows.find((r) => r.isYou);
  return me ? { rank: me.rank, total: board.learners } : null;
}
