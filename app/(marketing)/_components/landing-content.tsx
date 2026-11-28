"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Braces,
  Check,
  CheckCircle,
  ClipboardCheck,
  Code,
  FlaskConical,
  Globe,
  MonitorPlay,
  Newspaper,
  Play,
  Smartphone,
  Sparkles,
  Terminal,
} from "lucide-react";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { AppLogoLink } from "@/app/_components/app-logo-link";
import { motion } from "framer-motion";
import type { LandingStats } from "@/actions/get-landing-stats";
import { COMPILER_URL } from "../dsa/_components/dsa-footer";

// Design: Penpot "01 - Landing", board "Landing - v4 (DSA + Compiler, 3 testing tracks)".

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

// Path sizes come from the server page (lib/assignments, the manual steps and lib/dsa-lessons), so
// they always match the roadmaps.
export type LandingPaths = {
  manualSteps: number;
  playwrightStages: number;
  cypressStages: number;
  dsaLessons: number;
  dsaSteps: { n: number; title: string; href: string; isNew: boolean }[];
};

interface LandingContentProps {
  stats: LandingStats;
  paths: LandingPaths;
}

const DSA_SNIPPET = `int total = sum(a, 4);
printf("%d\\n", total);   // 17`;

const SETUP_CARDS = [
  {
    file: ".env · git-ignored",
    lines: [
      { t: "BASE_URL=https://thedappled.com" },
      { t: "ASSIGNMENT_TOKEN=k3Pq9xZr2mWb" },
      { t: "DEMO_EMAIL=demo-k3pq@…" },
      { t: "DEMO_PASSWORD=••••••••••" },
    ],
    title: "Config from .env",
    text: "Read with dotenv in playwright.config — never hard-coded, never committed.",
  },
  {
    file: ".github/workflows/tests.yml",
    lines: [
      { t: "- run: npx playwright test" },
      { t: "  env:" },
      { t: "    BASE_URL: ${{ secrets.BASE_URL }}", hi: true },
      { t: "    DEMO_PASSWORD: ${{ secrets… }}", hi: true },
    ],
    title: "CI with repository secrets",
    text: "Your tests run in GitHub Actions; we check the workflow when you submit.",
  },
  {
    file: "tests/",
    lines: [
      { t: "├─ pages/LoginPage.ts" },
      { t: "├─ pages/CartPage.ts" },
      { t: "├─ fixtures.ts   test.extend()", hi: true },
      { t: "└─ checkout.spec.ts" },
    ],
    title: "Page objects & fixtures",
    text: "Locators live in page classes; specs only call page-object methods.",
  },
];

const OFFERINGS = [
  { title: "Video Courses", text: "Project-based tutorials covering full-stack development.", href: "/search", cta: "Browse courses", Icon: MonitorPlay, tone: "blue" },
  { title: "Interactive Books", text: "Deep-dive reading with bookmarks and progress tracking.", href: "/books", cta: "Explore books", Icon: BookOpen, tone: "purple" },
  { title: "Tech Insights", text: "AI-researched articles on the latest market trends.", href: "/blogs", cta: "Read articles", Icon: Newspaper, tone: "emerald" },
  { title: "Testing Path", text: "Manual, Playwright and Cypress tracks with verified assignments.", href: "/testing", cta: "Start the path", Icon: FlaskConical, tone: "amber" },
  { title: "DSA Path", text: "Step-by-step lessons, plain English first, then C you can run.", href: "/dsa", cta: "Start with step 0", Icon: Braces, tone: "blue", isNew: true },
  { title: "C Compiler", text: "Step through C line by line and watch the stack and heap.", href: COMPILER_URL, cta: "Open the Compiler", Icon: Terminal, tone: "purple", external: true },
] as const;

const TONE = {
  blue: { icon: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400", link: "text-blue-600 dark:text-blue-400", chip: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300", tick: "text-blue-600" },
  purple: { icon: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400", link: "text-purple-600 dark:text-purple-400", chip: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300", tick: "text-purple-600" },
  emerald: { icon: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400", link: "text-emerald-600 dark:text-emerald-400", chip: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300", tick: "text-emerald-600" },
  amber: { icon: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400", link: "text-amber-700 dark:text-amber-400", chip: "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300", tick: "text-amber-600" },
} as const;

// Text half of a "Learn your way" row.
function FeatureText({
  tone,
  Icon,
  label,
  title,
  text,
  points,
  href,
  cta,
}: {
  tone: keyof typeof TONE;
  Icon: typeof MonitorPlay;
  label: string;
  title: string;
  text: string;
  points: string[];
  href: string;
  cta: string;
}) {
  return (
    <div className="flex-1 space-y-6">
      <div className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-semibold ${TONE[tone].chip}`}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </div>
      <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">{title}</h3>
      <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
      <ul className="space-y-3">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <Check className={`h-5 w-5 shrink-0 ${TONE[tone].tick}`} />
            {p}
          </li>
        ))}
      </ul>
      <Link href={href} className={`inline-block font-semibold hover:underline ${TONE[tone].link}`}>
        {cta} &rarr;
      </Link>
    </div>
  );
}

const mockCard = "relative w-full rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900";

function CoursesMock() {
  const chapters = [
    { t: "1. Project setup", s: "done" },
    { t: "2. Routing", s: "done" },
    { t: "3. Data fetching", s: "now" },
    { t: "4. Auth", s: "todo" },
    { t: "5. Payments", s: "todo" },
  ];
  return (
    <div className={`${mockCard} grid grid-cols-[1fr_auto] gap-4 p-5`} aria-hidden="true">
      <div className="min-w-0">
        <div className="relative flex aspect-video items-center justify-center rounded-xl bg-slate-900">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <Play className="ml-0.5 h-6 w-6 text-white" />
          </span>
          <div className="absolute bottom-3 left-3 right-3 h-1.5 rounded-full bg-slate-700">
            <div className="h-full w-1/3 rounded-full bg-blue-500" />
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-50">Full-stack Next.js · Chapter 3 of 12</p>
        <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-full w-1/4 rounded-full bg-blue-600" />
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">25% complete · resume where you left off</p>
      </div>
      <div className="hidden w-40 space-y-2 sm:block">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Chapters</p>
        {chapters.map((c) => (
          <div
            key={c.t}
            className={`truncate rounded-lg px-3 py-2 text-xs ${
              c.s === "done"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : c.s === "now"
                  ? "bg-blue-100 font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {c.s === "done" ? "✓ " : c.s === "now" ? "▶ " : ""}
            {c.t}
          </div>
        ))}
      </div>
    </div>
  );
}

function BooksMock() {
  return (
    <div className={`${mockCard} grid grid-cols-[auto_1fr] overflow-hidden`} aria-hidden="true">
      <div className="hidden w-40 bg-purple-50 p-5 dark:bg-purple-950/30 sm:flex sm:flex-col">
        <p className="text-[11px] font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300">Contents</p>
        <ul className="m-0 mt-3 list-none space-y-2 p-0 text-xs text-slate-500 dark:text-slate-400">
          <li>1. Pointers</li>
          <li className="font-bold text-purple-700 dark:text-purple-300">2. Memory layout</li>
          <li>3. Linked lists</li>
          <li>4. Trees</li>
        </ul>
        <div className="mt-auto pt-6">
          <div className="h-1.5 rounded-full bg-purple-200 dark:bg-purple-900">
            <div className="h-full w-2/5 rounded-full bg-purple-600" />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">40% read</p>
        </div>
      </div>
      <div className="min-w-0 space-y-3 p-5">
        <p className="text-lg font-extrabold text-slate-900 dark:text-slate-50">2. Memory layout</p>
        <div className="h-2 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-2 w-11/12 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-2 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs leading-5 text-slate-200">
{`int *p = malloc(sizeof(int));
*p = 42;
`}<span className="text-emerald-300">free(p); // heap released</span>
        </pre>
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-900 dark:bg-purple-950/40">
          <p className="flex items-center gap-1.5 text-sm font-bold text-purple-700 dark:text-purple-300">
            <Bookmark className="h-3.5 w-3.5" /> Bookmarked
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Stack vs heap — come back to this before the quiz.</p>
        </div>
      </div>
    </div>
  );
}

function ArticlesMock() {
  const posts = [
    { t: "Playwright vs Cypress in 2026", m: "6 min read · 12 sources", fresh: true },
    { t: "Next.js 16: what changed for app routes", m: "5 min read · 9 sources", fresh: false },
    { t: "Postgres or SQLite for side projects?", m: "4 min read · 7 sources", fresh: false },
  ];
  return (
    <div className={`${mockCard} space-y-3 p-5`} aria-hidden="true">
      {posts.map((p) => (
        <div
          key={p.t}
          className={`flex items-center gap-4 rounded-xl border p-3 ${p.fresh ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-slate-200 dark:border-slate-800"}`}
        >
          <div className={`h-14 w-14 shrink-0 rounded-lg ${p.fresh ? "bg-emerald-200 dark:bg-emerald-900" : "bg-slate-100 dark:bg-slate-800"}`} />
          <div className="min-w-0">
            {p.fresh && <span className="mb-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">This week</span>}
            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-50">{p.t}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{p.m}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LandingContent({ stats, paths }: LandingContentProps) {
  const statItems = [
    { label: "Video Courses", value: stats.courses, suffix: "+", accent: "" },
    { label: "Interactive Books", value: stats.books, suffix: "+", accent: "" },
    { label: "Tech Articles", value: stats.articles, suffix: "+", accent: "" },
    { label: "Playwright stages", value: paths.playwrightStages, suffix: "", accent: "text-amber-700 dark:text-amber-400" },
    { label: "DSA lessons", value: paths.dsaLessons, suffix: "", accent: "text-blue-600 dark:text-blue-400" },
  ].filter((item) => item.value > 0); // "0+" looks broken — only show counts with real content behind them

  const testingTracks = [
    {
      title: "Manual testing",
      meta: `${paths.manualSteps} steps · beginner`,
      text: "Fundamentals, test design, bug reports and exploratory testing. Each step ends with a quiz.",
      href: "/testing/manual",
      Icon: ClipboardCheck,
      tone: "blue" as const,
    },
    {
      title: "Automation",
      meta: `Playwright ${paths.playwrightStages} stages · Cypress ${paths.cypressStages}`,
      text: "Framework setup, UI automation, page objects, annotations, cross-browser, fixtures and parallel runs.",
      href: "/testing/automation",
      Icon: Play,
      tone: "purple" as const,
    },
    {
      title: "Mobile testing",
      meta: "Appium · coming soon",
      text: "Emulators, locators, gestures, waits and CI for Android and iOS.",
      href: "/testing/mobile",
      Icon: Smartphone,
      tone: "emerald" as const,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 dark:text-slate-50 overflow-x-hidden">

      {/* 1. HERO */}
      <section className="relative overflow-hidden px-4 py-20 lg:py-28 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-purple-200/40 dark:bg-purple-900/20 blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div variants={fadeIn}>
              <Link href="/dsa/foundations/tracing" className="mb-6 inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm hover:bg-emerald-100 dark:hover:bg-emerald-900 transition">
                <span className="flex h-2 w-2 rounded-full bg-emerald-600 mr-2 animate-pulse"></span>
                New in DSA: Tracing code · three first problems in C
              </Link>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              <span className="block text-2xl md:text-3xl font-bold tracking-tight text-slate-500 dark:text-slate-400 mb-3">
                The Dappled
              </span>
              Master modern tech with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">intelligent learning.</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mb-8 leading-relaxed">
              Video courses, interactive books, AI-researched articles, a hands-on testing path and a step-by-step DSA path with a built-in C
              Compiler &mdash; one platform built for developers.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-md px-8 py-6 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all">
                    Start learning free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/search" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-md px-8 py-6 rounded-xl shadow-lg">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </SignedIn>
              <Link href="#paths" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-md px-8 py-6 rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Explore the paths
                </Button>
              </Link>
            </motion.div>

            <motion.p variants={fadeIn} className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              Free to start · Playwright, Cypress and manual testing · DSA lessons you can run
            </motion.p>
          </div>

          {/* product preview */}
          <motion.div variants={fadeIn} className="relative w-full" aria-hidden="true">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
              <div className="h-10 bg-slate-100 dark:bg-slate-800 flex items-center px-4 gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 aspect-video rounded-xl bg-slate-900 flex items-center justify-center relative">
                    <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 h-1.5 rounded-full bg-slate-700">
                      <div className="h-full w-1/2 rounded-full bg-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-8 rounded-md ${i === 1 ? "bg-blue-100 dark:bg-blue-950" : "bg-slate-100 dark:bg-slate-800"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">Build a full-stack app — Chapter 3</p>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-2/3 rounded-full bg-blue-600" />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-purple-50 dark:bg-purple-950/40 p-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-700 dark:text-purple-300">
                      <BookOpen className="h-4 w-4 shrink-0" /> Books
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Bookmark &amp; track progress</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      <Sparkles className="h-4 w-4 shrink-0" /> Articles
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Market-aware, every week</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-300">
                      <FlaskConical className="h-4 w-4 shrink-0" /> Testing
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">6 of 6 verified</p>
                    <div className="mt-2 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-3">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300">
                      <Braces className="h-4 w-4 shrink-0" /> DSA
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Run in Compiler</p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">
                      <Play className="h-2.5 w-2.5" /> Run
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. STATS */}
      {statItems.length > 0 && (
        <section className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-10 flex flex-wrap justify-center gap-x-6 gap-y-8 text-center md:flex-nowrap">
            {statItems.map((item) => (
              <div key={item.label} className="flex w-[calc(50%-0.75rem)] flex-col items-center md:w-auto md:min-w-0 md:flex-1">
                <span className={`text-3xl md:text-4xl font-extrabold ${item.accent || "text-slate-900 dark:text-slate-50"}`}>
                  {item.value}
                  {item.suffix}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. ECOSYSTEM */}
      <section id="paths" className="scroll-mt-20 py-24 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">Your complete learning ecosystem</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Every developer learns differently — pick the format that fits you.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFERINGS.map(({ title, text, href, cta, Icon, tone, ...rest }) => {
              const isNew = "isNew" in rest && rest.isNew;
              const external = "external" in rest && rest.external;
              return (
                <motion.div
                  key={title}
                  variants={fadeIn}
                  className={`relative flex flex-col p-7 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                    isNew ? "border-blue-300 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/20" : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  {isNew && <span className="absolute right-5 top-5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">New</span>}
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 ${TONE[tone].icon}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-50">{title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{text}</p>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={`mt-auto text-sm font-semibold hover:underline ${TONE[tone].link}`}>
                      {cta} &rarr;
                    </a>
                  ) : (
                    <Link href={href} className={`mt-auto text-sm font-semibold hover:underline ${TONE[tone].link}`}>
                      {cta} &rarr;
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 4. LEARN YOUR WAY: courses, books, articles */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">Learn your way — watch, read or explore</h2>
            <p className="text-slate-600 dark:text-slate-400">Three formats, one account. Your progress follows you everywhere.</p>
          </div>

          <div className="space-y-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="flex flex-col md:flex-row items-center gap-12">
              <FeatureText
                tone="blue"
                Icon={MonitorPlay}
                label="Courses"
                title="Learn by building real projects"
                text="Project-based video courses that take you from setup to a deployed app, one chapter at a time."
                points={["Step-by-step video guidance", "Downloadable source code for every chapter", "Chapter-based progress tracking"]}
                href="/search"
                cta="Browse video courses"
              />
              <div className="flex-1 w-full"><CoursesMock /></div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="flex flex-col md:flex-row-reverse items-center gap-12">
              <FeatureText
                tone="purple"
                Icon={BookOpen}
                label="Books"
                title="Deep knowledge, distraction free"
                text="Interactive books let you read at your own pace, bookmark key ideas and master the theory behind the code."
                points={["Rich text with code blocks", "Bookmarks and reading progress per chapter", "Read anywhere, pick up where you stopped"]}
                href="/books"
                cta="Explore the library"
              />
              <div className="flex-1 w-full"><BooksMock /></div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="flex flex-col md:flex-row items-center gap-12">
              <FeatureText
                tone="emerald"
                Icon={Sparkles}
                label="AI Articles"
                title="Stay current with market intelligence"
                text="Articles researched from live sources every week — tool comparisons, trends and summaries without the doom-scroll."
                points={["Researched from live sources, with citations", "Unbiased tool comparisons", "Short, actionable takeaways"]}
                href="/blogs"
                cta="Read the latest articles"
              />
              <div className="flex-1 w-full"><ArticlesMock /></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. TESTING PATH */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Check className="h-4 w-4" /> Testing path · {testingTracks.length} tracks
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Learn test automation by doing it for real</h2>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Start with manual testing, then automate with Playwright or Cypress. Every check is verified from real runs, your repo is
              checked on GitHub, and you climb a live leaderboard.
            </p>
            <ul className="space-y-3">
              {["Verified automation — hand-driven runs don't count", "Framework first, then each stage improves on the last", "A live leaderboard for every stage and tool"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6">
                <Link href="/testing">
                  Start the testing path <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl px-6 border-slate-300 dark:border-slate-700">
                <Link href="/testing/leaderboard">View leaderboard</Link>
              </Button>
            </div>
          </motion.div>

          <motion.ul initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="m-0 list-none space-y-4 p-0">
            {testingTracks.map((tr) => (
              <motion.li key={tr.title} variants={fadeIn}>
                <Link
                  href={tr.href}
                  data-testid={`landing-track-${tr.href.split("/").pop()}`}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONE[tr.tone].icon}`}>
                    <tr.Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold text-slate-900 dark:text-slate-50">{tr.title}</span>
                    <span className={`mt-0.5 block text-sm font-semibold ${TONE[tr.tone].link}`}>{tr.meta}</span>
                    <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{tr.text}</span>
                  </span>
                  <ArrowRight className={`mt-1 h-5 w-5 shrink-0 transition group-hover:translate-x-0.5 ${TONE[tr.tone].link}`} />
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* 5b. DSA PATH */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeIn} className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Braces className="h-4 w-4" /> DSA path · New
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Learn DSA step by step, then run it yourself</h2>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Short lessons in plain English first, then C. Every chapter starts with what the last one taught, and every program opens in
              the Thedappled Compiler so you can step through it line by line.
            </p>
            <ul className="space-y-3">
              {["Plain English first, then C", "Run in Compiler on every program", "A 5-question check at the end of each step"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
                <Link href={paths.dsaSteps[0]?.href ?? "/dsa"}>
                  Start with {paths.dsaSteps[0]?.title ?? "the DSA path"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl px-6 border-slate-300 dark:border-slate-700">
                <a href={COMPILER_URL} target="_blank" rel="noopener noreferrer">Open the Compiler</a>
              </Button>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <p className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
                Foundations
                <span className="normal-case tracking-normal text-blue-600 dark:text-blue-400">{paths.dsaLessons} lessons live</span>
              </p>
              <ol className="m-0 mt-4 list-none space-y-2.5 p-0">
                {paths.dsaSteps.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="group flex items-center gap-3 text-[15px]">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.isNew ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"}`}
                      >
                        {s.n}
                      </span>
                      <span className={`group-hover:underline ${s.isNew ? "font-bold text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"}`}>{s.title}</span>
                      {s.isNew && (
                        <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          New · step {s.n}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
            <div className="overflow-hidden rounded-2xl bg-slate-900" aria-hidden="true">
              <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
                <span className="font-mono text-xs font-semibold text-slate-400">sum.c · C</span>
                <span className="inline-flex h-6 items-center gap-1 rounded-md bg-blue-600 px-2.5 text-[11px] font-semibold text-white">
                  <Play className="h-3 w-3" /> Run in Compiler
                </span>
              </div>
              <pre className="m-0 overflow-x-auto p-4 font-mono text-[13px] leading-[1.7] text-slate-200">{DSA_SNIPPET}</pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. SET UP LIKE A REAL TEAM */}
      <section className="pb-24 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">Set up your framework the way teams do</h2>
            <p className="text-slate-600 dark:text-slate-400">The testing path doesn&apos;t stop at scripts — you leave with a project you could ship.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {SETUP_CARDS.map((c) => (
              <div key={c.title} className="flex flex-col rounded-2xl bg-slate-900 p-6 text-slate-100 dark:border dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400">{c.file}</p>
                <pre className="mt-4 overflow-x-auto font-mono text-[13px] leading-7">
                  {c.lines.map((l) => (
                    <span key={l.t} className={`block ${"hi" in l && l.hi ? "text-emerald-300" : "text-slate-200"}`}>{l.t}</span>
                  ))}
                </pre>
                <p className="mt-6 font-bold text-white">{c.title}</p>
                <p className="mt-1 text-sm text-slate-400">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14 text-slate-900 dark:text-slate-50">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { n: 1, title: "Pick a path", text: "Courses, books, articles, the testing path or DSA." },
              { n: 2, title: "Learn by building", text: "Ship projects and pass verified assignments." },
              { n: 3, title: "Track progress", text: "Resume anywhere, see verified checks and your rank." },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 flex items-center justify-center text-lg font-bold mb-5">{step.n}</div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-50">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. AI SECTION */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, -45, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="flex-1 space-y-8">
            <div className="inline-flex items-center rounded-full bg-slate-800 border border-slate-700 px-4 py-1.5 text-sm text-blue-400 font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by Google Gemini &amp; Tavily
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Create content at <br /> the speed of AI
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              An agent researches the live web and drafts citation-backed tutorials and comparisons — you stay in control of the final cut.
            </p>
            <div className="flex flex-col gap-4 pt-2">
              {[
                { icon: Globe, color: "text-emerald-500", title: "Real-time market research", text: "Searches top sources for the latest versions." },
                { icon: Code, color: "text-purple-500", title: "Split-view studio", text: "Compare the AI draft with your final content." },
                { icon: CheckCircle, color: "text-blue-500", title: "Smart SEO tags", text: "Auto-generate trending keywords." },
              ].map((item, index) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} className="flex items-start gap-3">
                  <item.icon className={`h-6 w-6 ${item.color} mt-1`} />
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex-1 w-full max-w-lg lg:max-w-none" aria-hidden="true">
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-800/50 backdrop-blur-sm flex flex-col">
              <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 flex">
                <div className="flex-1 border-r border-slate-700 p-6 flex flex-col gap-3">
                  <div className="h-4 w-3/4 bg-slate-700 rounded" />
                  <div className="h-4 w-full bg-slate-700/50 rounded" />
                  <div className="h-4 w-5/6 bg-slate-700/50 rounded" />
                  <div className="h-24 w-full bg-slate-700/30 rounded mt-4 border border-slate-700 border-dashed flex items-center justify-center text-slate-500 text-sm">Your editor</div>
                </div>
                <div className="flex-1 p-6 flex flex-col gap-3 bg-purple-500/5">
                  <div className="h-4 w-1/2 bg-purple-500/40 rounded" />
                  <div className="h-4 w-full bg-purple-500/20 rounded" />
                  <div className="h-4 w-full bg-purple-500/20 rounded" />
                  <div className="mt-auto p-3 bg-slate-800 rounded border border-purple-500/30 text-xs text-purple-200">✨ Drafting from live sources…</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="px-4 py-20 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto rounded-3xl bg-blue-600 px-6 py-14 text-center text-white shadow-xl">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Start learning today &mdash; it&apos;s free</h2>
          <p className="text-blue-100 mb-8">Pick a path — courses, books, articles, testing or DSA — and build something real.</p>
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 rounded-xl font-semibold">Create free account</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/search">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 rounded-xl font-semibold">Go to Dashboard</Button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-14 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-white px-3 py-2">
                <AppLogoLink className="hover:opacity-90 transition" />
              </div>
              <p className="text-sm text-slate-400 max-w-xs">Learn modern tech with courses, books, AI-powered articles and a hands-on testing path.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Learn</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/search" className="hover:text-white transition">Courses</Link></li>
                <li><Link href="/books" className="hover:text-white transition">Books</Link></li>
                <li><Link href="/blogs" className="hover:text-white transition">Blogs</Link></li>
                <li><Link href="/testing" className="hover:text-white transition">Testing</Link></li>
                <li><Link href="/testing/leaderboard" className="hover:text-white transition">Leaderboard</Link></li>
                <li><a href="https://c-architech-compiler.vercel.app/?tab=compiler" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Compiler</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-800 text-sm text-slate-500">© {new Date().getFullYear()} TheDappled Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
