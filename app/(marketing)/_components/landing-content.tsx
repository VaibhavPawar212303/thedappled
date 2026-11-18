"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  MonitorPlay,
  Newspaper,
  Sparkles,
  Code,
  Globe,
  Play,
  Layers,
  Check
} from "lucide-react";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { AppLogoLink } from "@/app/_components/app-logo-link";
import { motion } from "framer-motion";
import type { LandingStats } from "@/actions/get-landing-stats";

// Animation Variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

interface LandingContentProps {
  stats: LandingStats;
}

export default function LandingContent({ stats }: LandingContentProps) {
  const statItems = [
    { label: "Video Courses", value: stats.courses },
    { label: "Interactive Books", value: stats.books },
    { label: "Tech Articles", value: stats.articles },
  ];
  // A stat row showing "0+" everywhere looks broken, not professional — only
  // show it once there's real published content to point to.
  const hasStats = statItems.some((item) => item.value > 0);

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-900 dark:text-slate-50 overflow-x-hidden">

      {/* ================================================== */}
      {/* 1. HERO SECTION                                    */}
      {/* ================================================== */}
      <section className="relative overflow-hidden px-4 py-20 lg:py-28 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-purple-200/40 dark:bg-purple-900/20 blur-3xl" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left: copy */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div variants={fadeIn} className="mb-6 inline-flex items-center rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              New: AI-Powered Research Agent
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Master modern tech with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                intelligent learning.
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-xl mb-8 leading-relaxed">
              Video courses, interactive books and AI-researched articles &mdash; one platform built for developers.
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

              <Link href="/blogs" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-md px-8 py-6 rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Read articles
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right: product preview */}
          <motion.div variants={fadeIn} className="relative w-full">
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
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full w-2/3 rounded-full bg-blue-600" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-purple-50 dark:bg-purple-950/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
                      <BookOpen className="h-4 w-4" /> Interactive books
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Bookmark &amp; track progress</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      <Sparkles className="h-4 w-4" /> AI articles
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Market-aware, every week</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================== */}
      {/* 1b. STATS BAR (live counts)                        */}
      {/* ================================================== */}
      {hasStats && (
        <section className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-3 gap-8 text-center">
            {statItems.map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50">
                  {item.value}+
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* 2. OFFERINGS GRID (Summary)                        */}
      {/* ================================================== */}
      <section className="py-24 px-4 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              Your Complete Learning Ecosystem
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We provide multiple modalities of learning because every developer learns differently.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Card 1 */}
            <motion.div variants={fadeIn} className="group relative flex flex-col items-center text-center p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 dark:from-blue-950/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-16 w-16 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <MonitorPlay className="h-8 w-8" />
              </div>
              <h3 className="relative text-xl font-bold mb-3 text-slate-900 dark:text-slate-50">Video Courses</h3>
              <p className="relative text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Project-based video tutorials covering full-stack development.
              </p>
              <Link href="/search" className="relative mt-auto text-sm font-semibold text-blue-600 hover:underline">
                Browse courses &rarr;
              </Link>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={fadeIn} className="group relative flex flex-col items-center text-center p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 dark:from-purple-950/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-16 w-16 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="relative text-xl font-bold mb-3 text-slate-900 dark:text-slate-50">Interactive Books</h3>
              <p className="relative text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Deep-dive reading material with progress tracking.
              </p>
              <Link href="/books" className="relative mt-auto text-sm font-semibold text-purple-600 hover:underline">
                Explore books &rarr;
              </Link>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={fadeIn} className="group relative flex flex-col items-center text-center p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-900">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 dark:from-emerald-950/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-16 w-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Newspaper className="h-8 w-8" />
              </div>
              <h3 className="relative text-xl font-bold mb-3 text-slate-900 dark:text-slate-50">Tech Insights</h3>
              <p className="relative text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                AI-researched articles for the latest market trends.
              </p>
              <Link href="/blogs" className="relative mt-auto text-sm font-semibold text-emerald-600 hover:underline">
                Read articles &rarr;
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2b. HOW IT WORKS                                   */}
      {/* ================================================== */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-14 text-slate-900 dark:text-slate-50">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { n: 1, title: "Pick a path", text: "Choose courses, books or articles." },
              { n: 2, title: "Learn by building", text: "Follow chapters and ship real projects." },
              { n: 3, title: "Track progress", text: "Resume anywhere, see what you completed." },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center text-center md:items-start md:text-left">
                <div className="h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 flex items-center justify-center text-lg font-bold mb-5">
                  {step.n}
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-50">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. DEEP DIVE EXPLANATION (New Section)             */}
      {/* ================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 space-y-24">

          {/* Feature 1: Courses (Blue) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="flex flex-col md:flex-row items-center gap-12"
          >
            <div className="flex-1 space-y-6">
                <div className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-950 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                    <MonitorPlay className="h-4 w-4 mr-2" />
                    Courses
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Learn by Building Real Projects</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    Stop watching tutorials that don't go anywhere. Our courses are structured around building production-ready applications from scratch.
                </p>
                <ul className="space-y-3">
                    {["Step-by-step video guidance", "Downloadable source code", "Chapter-based progress tracking"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                            <Check className="h-5 w-5 text-blue-600" />
                            {item}
                        </li>
                    ))}
                </ul>
                <Link href="/search">
                    <Button variant="link" className="text-blue-600 p-0 h-auto font-semibold mt-2">
                        Browse Video Courses &rarr;
                    </Button>
                </Link>
            </div>
            {/* Visual Mockup - Video Player */}
            <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full" />
                <div className="relative aspect-video bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center group">
                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <div className="h-16 w-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 text-blue-600 ml-1" />
                        </div>
                    </div>
                    {/* Fake UI Elements */}
                    <div className="absolute bottom-4 left-4 right-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-blue-600 rounded-full" />
                    </div>
                </div>
            </div>
          </motion.div>

          {/* Feature 2: Books (Purple) - Reverse Layout */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="flex flex-col md:flex-row-reverse items-center gap-12"
          >
            <div className="flex-1 space-y-6">
                <div className="inline-flex items-center rounded-md bg-purple-100 dark:bg-purple-950 px-3 py-1 text-sm font-medium text-purple-700 dark:text-purple-300">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Books
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Deep Knowledge, Distraction Free</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    Sometimes video isn't enough. Our interactive books allow you to read at your own pace, bookmark key concepts, and master the theory behind the code.
                </p>
                <ul className="space-y-3">
                    {["Rich text formatting with code blocks", "Lifetime access to updates", "Read anywhere, anytime"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                            <Check className="h-5 w-5 text-purple-600" />
                            {item}
                        </li>
                    ))}
                </ul>
                <Link href="/books">
                    <Button variant="link" className="text-purple-600 p-0 h-auto font-semibold mt-2">
                        Explore Library &rarr;
                    </Button>
                </Link>
            </div>
            {/* Visual Mockup - Book Reader */}
            <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-purple-600/5 blur-3xl rounded-full" />
                <div className="relative aspect-[4/3] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 flex flex-col gap-4">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-100 dark:border-purple-900">
                        <div className="h-3 w-1/2 bg-purple-200 dark:bg-purple-800 rounded mb-2" />
                        <div className="h-3 w-3/4 bg-purple-200 dark:bg-purple-800 rounded" />
                    </div>
                </div>
            </div>
          </motion.div>

          {/* Feature 3: Blogs (Emerald) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="flex flex-col md:flex-row items-center gap-12"
          >
            <div className="flex-1 space-y-6">
                <div className="inline-flex items-center rounded-md bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    <Newspaper className="h-4 w-4 mr-2" />
                    AI Articles
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Stay Updated with Market Intelligence</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    Technology moves fast. Our AI agents browse the web daily to create up-to-date articles, comparisons, and summaries so you don't have to doom-scroll.
                </p>
                <ul className="space-y-3">
                    {["Real-time data fetching", "Unbiased tool comparisons", "Concise, actionable insights"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                            <Check className="h-5 w-5 text-emerald-600" />
                            {item}
                        </li>
                    ))}
                </ul>
                <Link href="/blogs">
                    <Button variant="link" className="text-emerald-600 p-0 h-auto font-semibold mt-2">
                        Read Latest Articles &rarr;
                    </Button>
                </Link>
            </div>
            {/* Visual Mockup - Blog List */}
            <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-emerald-600/5 blur-3xl rounded-full" />
                <div className="relative aspect-video bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-2">
                        <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex gap-4 items-center">
                            <div className="h-12 w-12 rounded bg-emerald-100 dark:bg-emerald-950 flex-shrink-0" />
                            <div className="space-y-2 w-full">
                                <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-2 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                        <div className="flex gap-4 items-center opacity-60">
                            <div className="h-12 w-12 rounded bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                            <div className="space-y-2 w-full">
                                <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-2 w-1/3 bg-slate-100 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 4. FEATURE HIGHLIGHT (AI / MCP Flow)               */}
      {/* ================================================== */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, -45, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16 relative z-10">

          {/* Text Content */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="flex-1 space-y-8"
          >
            <div className="inline-flex items-center rounded-full bg-slate-800 border border-slate-700 px-4 py-1.5 text-sm text-blue-400 font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by Google Gemini 2.0 & Tavily
            </div>

            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Create Content at the <br /> Speed of AI
            </h2>

            <p className="text-slate-400 text-lg leading-relaxed">
              Our platform leverages agentic AI workflows (MCP) to research the web in real-time.
              Instead of relying on outdated training data, our AI browses the live internet
              to draft accurate, citation-backed tutorials and comparisons.
            </p>

            <div className="flex flex-col gap-4 pt-4">
              {[
                { icon: Globe, color: "text-emerald-500", title: "Real-time Market Research", text: "Searches top sources for latest versions." },
                { icon: Code, color: "text-purple-500", title: "Split-View Studio", text: "Compare AI draft with your final content." },
                { icon: CheckCircle, color: "text-blue-500", title: "Smart SEO Tags", text: "Auto-generate trending keywords." }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-start gap-3"
                >
                  <item.icon className={`h-6 w-6 ${item.color} mt-1`} />
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual Placeholder / Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full max-w-lg lg:max-w-none"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-800/50 backdrop-blur-sm flex flex-col group hover:shadow-blue-500/10 transition-shadow">
              {/* Fake Browser Header */}
              <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>

              {/* Split View Representation */}
              <div className="flex-1 flex">
                <div className="flex-1 border-r border-slate-700 p-6 flex flex-col gap-3">
                  <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-full bg-slate-700/50 rounded animate-pulse delay-75" />
                  <div className="h-4 w-5/6 bg-slate-700/50 rounded animate-pulse delay-100" />
                  <div className="h-32 w-full bg-slate-700/30 rounded mt-4 border border-slate-700 border-dashed flex items-center justify-center text-slate-500 text-sm">
                    Public Editor
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col gap-3 bg-purple-500/5">
                  <div className="h-4 w-1/2 bg-purple-500/40 rounded" />
                  <div className="h-4 w-full bg-purple-500/20 rounded" />
                  <div className="h-4 w-full bg-purple-500/20 rounded" />
                  <div className="mt-auto p-3 bg-slate-800 rounded border border-purple-500/30 text-xs text-purple-200">
                    ✨ Generating draft from live data...
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. FINAL CTA                                       */}
      {/* ================================================== */}
      <section className="px-4 py-20 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto rounded-3xl bg-blue-600 px-6 py-14 text-center text-white shadow-xl">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Start learning today &mdash; it&apos;s free</h2>
          <p className="text-blue-100 mb-8">Pick a path and build something real.</p>
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 rounded-xl font-semibold">
                Create free account
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/search">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 rounded-xl font-semibold">
                Go to Dashboard
              </Button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. FOOTER                                          */}
      {/* ================================================== */}
      <footer className="bg-slate-900 text-slate-300 py-14 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-white px-3 py-2">
                <AppLogoLink className="hover:opacity-90 transition" />
              </div>
              <p className="text-sm text-slate-400 max-w-xs">
                Learn modern tech with courses, books and AI-powered articles.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Learn</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/search" className="hover:text-white transition">Courses</Link></li>
                <li><Link href="/books" className="hover:text-white transition">Books</Link></li>
                <li><Link href="/blogs" className="hover:text-white transition">Blogs</Link></li>
                <li><a href="https://c-architech-compiler.vercel.app/?tab=revision" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Compiler</a></li>
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
          <div className="mt-10 pt-6 border-t border-slate-800 text-sm text-slate-500">
            © {new Date().getFullYear()} TheDappled Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
