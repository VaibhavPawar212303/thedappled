// A dark code block whose lines are lists of [text, kind] pieces: k = keyword, s = string, c = comment.
// Used by the annotation lessons (stages 5 and 6).
export type Piece = [string, ("k" | "s" | "c")?];
const TONE = { k: "text-blue-300", s: "text-emerald-300", c: "text-slate-400" } as const;

export function Code({ lines }: { lines: Piece[][] }) {
  return (
    <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-[12.5px] leading-6 text-slate-100">
      {lines.map((l, i) => (
        <span key={i} className="block whitespace-pre">
          {l.map(([t, k], j) => (
            <span key={j} className={k ? TONE[k] : undefined}>{t}</span>
          ))}
        </span>
      ))}
    </pre>
  );
}
