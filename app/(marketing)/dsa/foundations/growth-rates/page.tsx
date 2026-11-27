import type * as React from "react";
import type { Metadata } from "next";
import { DsaLessonLayout, SectionHead } from "../../_components/dsa-lesson-layout";
import { CodeBlock } from "../../_components/code-block";
import { Cards, P, Tip } from "../../_components/lesson-blocks";

// Design: Penpot "27 - DSA Learning Path", page "Foundations 6 – Growth rates & memory".

export const metadata: Metadata = {
  title: "Growth rates & memory: O(1) to O(n!) and space complexity – DSA step 6",
  description:
    "DSA Foundations step 6: the nine common growth rates from O(1) to O(n!) with step counts, space complexity (extra memory) in C, and simple rules of thumb for Big-O.",
  alternates: { canonical: "/dsa/foundations/growth-rates" },
};

const TOC = [
  { id: "growth-rates", label: "Common growth rates" },
  { id: "memory", label: "Memory counts too" },
  { id: "rules", label: "Rules of thumb" },
];

// "~1.3 × 10" with exponent "30" -> rendered with a real <sup> (monospace fonts lack superscript digits).
const pow = (base: string, exp: string) => (
  <>
    {base}
    <sup>{exp}</sup>
  </>
);

// tone: "warn" = quadratic / cubic (amber), "bad" = exponential / factorial (red)
const GROWTH: { o: string; name: string; ex: string; v: [React.ReactNode, React.ReactNode, React.ReactNode]; tone?: "warn" | "bad" }[] = [
  { o: "O(1)", name: "Constant", ex: "Read a[i]", v: ["1", "1", "1"] },
  { o: "O(log n)", name: "Logarithmic", ex: "Binary search", v: ["~3", "~7", "~10"] },
  { o: "O(√n)", name: "Square root", ex: "Prime check up to √n", v: ["~3", "10", "~32"] },
  { o: "O(n)", name: "Linear", ex: "Scan a list once", v: ["10", "100", "1,000"] },
  { o: "O(n log n)", name: "Linearithmic", ex: "Merge sort", v: ["~33", "~664", "~10,000"] },
  { o: "O(n²)", name: "Quadratic", ex: "Compare every pair", v: ["100", "10,000", "1,000,000"], tone: "warn" },
  { o: "O(n³)", name: "Cubic", ex: "Three nested loops", v: ["1,000", "1,000,000", "1,000,000,000"], tone: "warn" },
  { o: "O(2ⁿ)", name: "Exponential", ex: "Try every subset", v: ["1,024", pow("~1.3 × 10", "30"), pow("~1.1 × 10", "301")], tone: "bad" },
  { o: "O(n!)", name: "Factorial", ex: "Try every ordering", v: ["3,628,800", pow("~9.3 × 10", "157"), pow("~4.0 × 10", "2567")], tone: "bad" },
];

const ROW_TONE = {
  warn: { row: "bg-amber-50 dark:bg-amber-950/30", val: "text-amber-700 dark:text-amber-400" },
  bad: { row: "bg-red-50 dark:bg-red-950/30", val: "text-red-700 dark:text-red-400" },
};

const MEMORY = `// O(1) extra memory: one box
int total = 0;
for (int i = 0; i < n; i++) total += a[i];

// O(n) extra memory: one new box per item
int copy[n];
for (int i = 0; i < n; i++) copy[i] = a[i];`;

export default function GrowthRatesLessonPage() {
  return (
    <DsaLessonLayout
      step="dsa-growth-memory"
      intro="Put it all together: the growth rates you'll meet most, how fast each one grows, and how to measure memory as well as time."
      minutes={12}
      toc={TOC}
    >
      <section>
        <SectionHead n={1} id="growth-rates" title="Common growth rates" />
        <P>Most algorithms you&apos;ll meet fall into a handful of growth rates. Read each row left to right to see how the work grows as n gets 10× bigger.</P>
        <div className="mt-6 overflow-x-auto rounded-xl border">
          <table data-testid="growth-table" className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-muted-foreground dark:bg-slate-800">
              <tr>
                {["Big-O", "Name", "Example", "n = 10", "n = 100", "n = 1,000"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {GROWTH.map((g) => {
                const tone = g.tone ? ROW_TONE[g.tone] : null;
                return (
                  <tr key={g.o} className={`border-t ${tone?.row ?? ""}`}>
                    <th scope="row" className="whitespace-nowrap px-4 py-3 font-mono font-bold text-blue-700 dark:text-blue-300">{g.o}</th>
                    <td className="px-4 py-3">{g.name}</td>
                    <td className="px-4 py-3">{g.ex}</td>
                    {g.v.map((v, i) => (
                      <td key={i} className={`whitespace-nowrap px-4 py-3 font-mono ${tone?.val ?? ""}`}>{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Step counts are rounded; log means log base 2. k nested loops give O(n<sup>k</sup>), and O(log log n) also exists but is rare. Constants are dropped, so
          O(2n) is just O(n) — but O(2ⁿ) and O(n!) grow so fast they only work for very small n.
        </p>
      </section>

      <section>
        <SectionHead n={2} id="memory" title="Memory counts too" />
        <P>Time is how many steps. Space is how much extra memory the algorithm needs while it runs, not counting the input itself.</P>
        <div data-testid="memory-visual" className="mt-6 grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-2 sm:p-5">
          <div className="rounded-xl border bg-slate-50 p-5 dark:bg-slate-900/40">
            <p className="font-bold">Sum the list</p>
            <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">O(1) extra memory</p>
            <div className="mt-4 flex gap-1.5" aria-hidden="true">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-background font-mono text-sm font-bold dark:border-blue-900">Σ</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">One box (total), however long the list is.</p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-5 dark:bg-slate-900/40">
            <p className="font-bold">Copy the list</p>
            <p className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400">O(n) extra memory</p>
            <div className="mt-4 flex gap-1.5" aria-hidden="true">
              {["5", "2", "9", "1", "7", "…"].map((v, i) => (
                <span key={i} className="flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-background font-mono text-sm font-bold dark:border-blue-900">
                  {v}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">One new box for every item: n items → n boxes.</p>
          </div>
        </div>
        <div className="mt-4">
          <CodeBlock file="memory.c · C" code={MEMORY} />
        </div>
      </section>

      <section>
        <SectionHead n={3} id="rules" title="Rules of thumb" />
        <Cards
          items={[
            { big: "2n → n", t: "Drop constants", d: "O(2n) is just O(n)." },
            { big: "n² + n", t: "Keep the biggest term", d: "O(n² + n) is O(n²)." },
            { big: "a + b", t: "Two inputs, two letters", d: "A loop over a, then a loop over b: O(a + b)." },
          ]}
        />
        <Tip title="Aim for this">On big inputs, aim for O(n log n) or better. O(2ⁿ) and O(n!) only work for very small n.</Tip>
      </section>
    </DsaLessonLayout>
  );
}
