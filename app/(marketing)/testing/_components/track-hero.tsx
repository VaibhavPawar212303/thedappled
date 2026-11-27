import Link from "next/link";
import { TONES, type Tone } from "./roadmap-data";

// Header for a track or tool page: breadcrumb, label, title and a short description.
// Design: Penpot "26 - Testing Learning Path", page "Roadmap – tracks", boards B–E.
export function TrackHero({ crumbs, label, title, blurb, tone }: { crumbs: { label: string; href?: string }[]; label: string; title: string; blurb: string; tone: Tone }) {
  const t = TONES[tone];
  return (
    <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900/40">
      <div className={`pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full blur-2xl ${t.blob}`} />
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-foreground">{c.label}</Link>
              ) : (
                <span aria-current="page" className="font-semibold text-foreground">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <span className={`mt-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${t.chip}`}>{label}</span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{blurb}</p>
      </div>
    </section>
  );
}
