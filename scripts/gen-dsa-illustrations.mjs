// Animated isometric SVG illustrations for the DSA Foundations lessons.
//   node scripts/gen-dsa-illustrations.mjs what-is-dsa public/dsa/what-is-dsa
//   node scripts/gen-dsa-illustrations.mjs algorithms public/dsa/algorithms
//   node scripts/gen-dsa-illustrations.mjs reading-loops public/dsa/reading-loops
// (add --static for the Penpot copy)
// Each picture is centred: the viewBox is fitted to the drawing's bounds (360:220, padded).
// Animations are CSS inside the SVG (they run in <img>), and stop for prefers-reduced-motion.
// --static writes the resting frame without animation (used for the Penpot design).
import fs from "node:fs";
import path from "node:path";

const [LESSON, OUT = "."] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!["what-is-dsa", "algorithms", "reading-loops"].includes(LESSON)) throw new Error("usage: gen-dsa-illustrations.mjs <what-is-dsa|algorithms|reading-loops> <outDir> [--static]");
const STATIC = process.argv.includes("--static");
const AR = 360 / 220;
const C = Math.cos(Math.PI / 6), S = Math.sin(Math.PI / 6);
const FONT = "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";

const BLUE = { top: "#BFDBFE", left: "#60A5FA", right: "#3B82F6", edge: "#1D4ED8" };
const GREEN = { top: "#A7F3D0", left: "#34D399", right: "#10B981", edge: "#047857" };
const GREY = { top: "#E2E8F0", left: "#CBD5E1", right: "#94A3B8", edge: "#64748B" };
const LABEL = "#64748B";

// ---- bounds tracking (for centring) ----
let BB;
const resetBB = () => (BB = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
const track = (x, y) => { BB.x0 = Math.min(BB.x0, x); BB.y0 = Math.min(BB.y0, y); BB.x1 = Math.max(BB.x1, x); BB.y1 = Math.max(BB.y1, y); };

const iso = (ox, oy, s) => Object.assign((x, y, z) => [ox + (x - y) * C * s, oy + (x + y) * S * s - z * s], { s });
const f = (n) => n.toFixed(1);
const pts = (a) => a.map(([x, y]) => (track(x, y), `${f(x)},${f(y)}`)).join(" ");

function box(p, x, y, z, w, d, h, col, attrs = "") {
  const top = [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)];
  const left = [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)];
  const right = [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)];
  const st = `stroke="${col.edge}" stroke-width="1" stroke-linejoin="round"`;
  return `<g ${attrs}><polygon points="${pts(left)}" fill="${col.left}" ${st}/><polygon points="${pts(right)}" fill="${col.right}" ${st}/><polygon points="${pts(top)}" fill="${col.top}" ${st}/></g>`;
}
function ground(p, x, y, w, d, fill = "#94A3B8", op = 0.16) {
  return `<polygon points="${pts([p(x, y, 0), p(x + w, y, 0), p(x + w, y + d, 0), p(x, y + d, 0)])}" fill="${fill}" fill-opacity="${op}" stroke="#94A3B8" stroke-opacity="0.35" stroke-dasharray="4 4"/>`;
}
function text(x, y, t, o = {}) {
  const size = o.size ?? 12, w = String(t).length * size * 0.58, anchor = o.anchor ?? "middle";
  const x0 = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
  track(x0, y - size); track(x0 + w, y + 3);
  return `<text x="${f(x)}" y="${f(y)}" font-family="${FONT}" font-size="${size}" font-weight="${o.weight ?? 600}" fill="${o.fill ?? LABEL}" text-anchor="${anchor}"${o.attrs ? " " + o.attrs : ""}>${t}</text>`;
}
function arrow(x1, y1, x2, y2, col = "#64748B", attrs = "") {
  const a = Math.atan2(y2 - y1, x2 - x1), L = 8;
  const h1 = [x2 - L * Math.cos(a - 0.45), y2 - L * Math.sin(a - 0.45)], h2 = [x2 - L * Math.cos(a + 0.45), y2 - L * Math.sin(a + 0.45)];
  track(x1, y1); track(x2, y2);
  return `<g ${attrs}><line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${col}" stroke-width="2" stroke-linecap="round"/><polygon points="${pts([[x2, y2], h1, h2])}" fill="${col}"/></g>`;
}
const topC = (p, x, y, z, w, d, h) => p(x + w / 2, y + d / 2, z + h);
// A caption centred under everything drawn so far.
const caption = (t, o = {}) => text((BB.x0 + BB.x1) / 2, BB.y1 + 22, t, { size: 12, ...o });

const BASE_CSS = `
g,line,polygon,text,rect{transform-box:fill-box}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}`;

// Wrap a drawing: fit the viewBox to its bounds (padded) at a 360:220 ratio, centred.
function svg(title, body, css = "", pad = 14) {
  let x0 = BB.x0 - pad, y0 = BB.y0 - pad, w = BB.x1 - BB.x0 + 2 * pad, h = BB.y1 - BB.y0 + 2 * pad;
  if (w / h > AR) { const nh = w / AR; y0 -= (nh - h) / 2; h = nh; } else { const nw = h * AR; x0 -= (nw - w) / 2; w = nw; }
  const style = STATIC ? "" : `<style>${BASE_CSS}${css}</style>`;
  if (STATIC) {
    // Penpot's SVG import needs the viewBox anchored at 0,0: shift every coordinate instead.
    body = body
      .replace(/points="([^"]+)"/g, (_, ps) => `points="${ps.split(" ").map((pr) => { const [a, b] = pr.split(","); return f(a - x0) + "," + f(b - y0); }).join(" ")}"`)
      .replace(/ (x|x1|x2|cx)="([-\d.]+)"/g, (_, k, v) => ` ${k}="${f(v - x0)}"`)
      .replace(/ (y|y1|y2|cy)="([-\d.]+)"/g, (_, k, v) => ` ${k}="${f(v - y0)}"`);
    x0 = 0; y0 = 0;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(x0)} ${f(y0)} ${f(w)} ${f(h)}" width="360" height="220" role="img" aria-label="${title}"><title>${title}</title>${style}${body}</svg>\n`;
}

const files = {};

// ===================== "What is DSA?" (Foundations step 0) =====================
if (LESSON === "what-is-dsa") {

// 1. Array: six boxes; an arrow drops onto a[5] and the box lifts (direct access, one step)
{
  resetBB();
  const p = iso(0, 0, 26);
  let b = ground(p, -0.4, -0.4, 6 * 1.15 + 0.3, 1.8);
  const vals = [7, 3, 9, 1, 4, 8];
  let top = "";
  for (let i = 0; i < 6; i++) {
    const x = i * 1.15, hot = i === 5;
    const [tx, ty] = topC(p, x, 0, 0, 1, 1, 1);
    const [ix, iy] = p(x + 0.5, 1.9, 0);
    b += `<g class="${hot ? "hot" : "cell"}" style="animation-delay:${(i * 0.12).toFixed(2)}s">${box(p, x, 0, 0, 1, 1, 1, hot ? GREEN : BLUE)}${text(tx, ty + 5, vals[i], { size: 14, weight: 800, fill: hot ? "#065F46" : "#1E3A8A" })}</g>`;
    b += text(ix, iy + 14, `[${i}]`, { size: 12, fill: hot ? "#059669" : LABEL, weight: hot ? 800 : 600 });
    if (hot) top = arrow(tx, ty - 48, tx, ty - 14, "#059669", 'class="drop"') + text(tx, ty - 54, "a[5]", { size: 13, weight: 800, fill: "#059669", attrs: 'class="drop"' });
  }
  const css = `
.cell{animation:wave 4s ease-in-out infinite}
@keyframes wave{0%,40%,100%{transform:translateY(0)}20%{transform:translateY(-4px)}}
.drop{animation:drop 4s ease-in-out infinite}
@keyframes drop{0%,45%{transform:translateY(-18px);opacity:0}60%,92%{transform:translateY(0);opacity:1}100%{opacity:0}}
.hot{animation:hot 4s ease-in-out infinite}
@keyframes hot{0%,58%,100%{transform:translateY(0)}68%{transform:translateY(-8px)}78%{transform:translateY(0)}}`;
  files["array"] = svg("Array: a row of numbered boxes; jump straight to box 5", b + top, css);
}

// 2. Stack: a plate is pushed onto the pile, then popped off again
{
  resetBB();
  const p = iso(0, 0, 34);
  let b = ground(p, -0.6, -0.6, 3.2, 3.2);
  for (let i = 0; i < 4; i++) b += box(p, 0, 0, i * 0.34, 2, 2, 0.26, BLUE);
  const plate = box(p, 0, 0, 4 * 0.34, 2, 2, 0.26, GREEN);
  const [tx, ty] = topC(p, 0, 0, 4 * 0.34, 2, 2, 0.26);
  b += `<g class="plate">${plate}${text(tx, ty + 4, "top", { size: 12, weight: 800, fill: "#065F46" })}</g>`;
  b += arrow(tx - 72, ty - 58, tx - 22, ty - 14, "#2563EB", 'class="push"') + text(tx - 78, ty - 64, "push", { size: 13, weight: 800, fill: "#2563EB", attrs: 'class="push"' });
  b += arrow(tx + 22, ty - 14, tx + 72, ty - 58, "#059669", 'class="pop"') + text(tx + 80, ty - 64, "pop", { size: 13, weight: 800, fill: "#059669", attrs: 'class="pop"' });
  b += caption("Last in, first out");
  const css = `
.plate{animation:plate 5s ease-in-out infinite}
@keyframes plate{0%{transform:translateY(-46px);opacity:0}12%{opacity:1}28%,62%{transform:translateY(0);opacity:1}82%{transform:translateY(-46px);opacity:1}92%,100%{transform:translateY(-46px);opacity:0}}
.push{animation:push 5s ease-in-out infinite}
@keyframes push{0%,30%{opacity:1}40%,100%{opacity:.25}}
.pop{animation:pop 5s ease-in-out infinite}
@keyframes pop{0%,58%{opacity:.25}64%,86%{opacity:1}100%{opacity:.25}}`;
  files["stack"] = svg("Stack: a pile of plates; push adds to the top, pop takes from the top", b, css);
}

// 3. Queue: the line moves forward; the front block leaves, a new one joins at the back
{
  resetBB();
  const p = iso(0, 0, 22);
  const SLOT = 1.4, N = 5;
  let b = ground(p, -1.8, -0.4, (N + 1) * SLOT + 0.6, 1.8);
  // highlight the front slot on the ground
  b += `<polygon points="${pts([p((N - 1) * SLOT - 0.2, -0.2, 0), p((N - 1) * SLOT + 1.2, -0.2, 0), p((N - 1) * SLOT + 1.2, 1.2, 0), p((N - 1) * SLOT - 0.2, 1.2, 0)])}" fill="#10B981" fill-opacity="0.22" stroke="#10B981" stroke-width="1.5"/>`;
  const [dx, dy] = (() => { const a = p(0, 0, 0), c = p(SLOT, 0, 0); return [c[0] - a[0], c[1] - a[1]]; })();
  // block -1 is the newcomer (fades in at the back); block N-1 is the front (leaves)
  for (let k = -1; k < N; k++) {
    const cls = k === -1 ? "q newq" : k === N - 1 ? "q front" : "q";
    b += `<g class="${cls}">${box(p, k * SLOT, 0, 0, 1, 1, 1.5, BLUE)}</g>`;
  }
  const [fx, fy] = p(N * SLOT, 0.5, 0.75);
  b += arrow(fx + 6, fy + 4, fx + 40, fy + 24, "#059669") + text(fx + 34, fy + 42, "out first", { size: 12, weight: 800, fill: "#059669" });
  const [bx, by] = p(-1.4, 0.5, 0.75);
  b += arrow(bx - 40, by - 24, bx - 4, by - 2, "#2563EB") + text(bx - 46, by - 30, "in", { size: 12, weight: 800, fill: "#2563EB" });
  b += caption("First in, first out");
  const css = `
.q{animation:q 3.2s ease-in-out infinite}
@keyframes q{0%,35%{transform:translate(0,0)}70%,100%{transform:translate(${f(dx)}px,${f(dy)}px)}}
.front{animation:q 3.2s ease-in-out infinite,leave 3.2s ease-in-out infinite}
@keyframes leave{0%,40%{opacity:1}70%,100%{opacity:0}}
.newq{animation:q 3.2s ease-in-out infinite,join 3.2s ease-in-out infinite}
@keyframes join{0%,35%{opacity:0}70%,100%{opacity:1}}`;
  // static frame: the newcomer is hidden
  const body = STATIC ? b.replace('class="q newq"', 'class="q newq" opacity="0"') : b;
  files["queue"] = svg("Queue: a line at a ticket counter; the first one in is served first", body, css);
}

// 4. Hash map: each key drops straight into its own bucket
{
  resetBB();
  const p = iso(0, 0, 24);
  let b = ground(p, -0.4, -0.4, 6.4, 1.8);
  const keys = [["cat", 0], ["sun", 2], ["map", 4]];
  let lab = "";
  for (let j = 0; j < 5; j++) {
    const ki = keys.findIndex(([, k]) => k === j);
    const used = ki >= 0;
    b += `<g${used ? ` class="bucket" style="animation-delay:${(ki * 0.7).toFixed(1)}s"` : ""}>${box(p, j * 1.25, 0, 0, 1, 1, 0.8, used ? (j === 2 ? GREEN : BLUE) : GREY)}</g>`;
    const [lx, ly] = p(j * 1.25 + 0.5, 1.9, 0);
    lab += text(lx, ly + 12, String(j), { size: 11 });
  }
  keys.forEach(([k, j], i) => {
    const green = j === 2;
    const [tx, ty] = topC(p, j * 1.25, 0, 0, 1, 1, 0.8);
    const kx = tx, ky = ty - 62;
    track(kx - 28, ky - 13); track(kx + 28, ky + 11);
    lab += `<g class="key" style="animation-delay:${(i * 0.7).toFixed(1)}s"><rect x="${f(kx - 28)}" y="${f(ky - 13)}" width="56" height="24" rx="12" fill="${green ? "#D1FAE5" : "#DBEAFE"}" stroke="${green ? "#10B981" : "#3B82F6"}"/>${text(kx, ky + 4, `"${k}"`, { size: 12, weight: 700, fill: green ? "#065F46" : "#1E3A8A" })}${arrow(kx, ky + 13, tx, ty - 6, green ? "#059669" : "#64748B")}</g>`;
  });
  lab += caption("key → its bucket, in one step");
  const css = `
.key{animation:key 4.2s ease-in-out infinite;opacity:0}
@keyframes key{0%{transform:translateY(-16px);opacity:0}14%,80%{transform:translateY(0);opacity:1}95%,100%{opacity:0;transform:translateY(0)}}
.bucket{animation:bucket 4.2s ease-in-out infinite}
@keyframes bucket{0%,12%,30%,100%{transform:translateY(0)}20%{transform:translateY(-5px)}}`;
  const body = STATIC ? (b + lab).replaceAll('class="key"', "") : b + lab;
  files["hash-map"] = svg("Hash map: each key goes straight to its own bucket, like a dictionary", body, css);
}

// 5. Tree: builds level by level, then floats
{
  resetBB();
  const node = (sx, sy, col) => box(iso(sx, sy + 11, 22), -0.5, -0.5, -1, 1, 1, 1, col);
  const N = [[180, 38], [110, 100], [250, 100], [70, 160], [150, 160], [210, 160], [290, 160]];
  const lvl = [0, 1, 1, 2, 2, 2, 2];
  let lines = "";
  [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].forEach(([a, c]) => {
    track(N[c][0], N[c][1]);
    lines += `<line class="t" style="animation-delay:${(lvl[c] * 0.45 - 0.2).toFixed(2)}s" x1="${N[a][0]}" y1="${N[a][1] + 14}" x2="${N[c][0]}" y2="${N[c][1]}" stroke="#94A3B8" stroke-width="2"/>`;
  });
  let nodes = "";
  N.forEach(([x, y], i) => (nodes += `<g class="t" style="animation-delay:${(lvl[i] * 0.45).toFixed(2)}s">${node(x, y, i === 0 ? GREEN : i < 3 ? BLUE : GREY)}</g>`));
  const top = text(180, 20, "root", { size: 12, weight: 800, fill: "#059669" });
  BB.y1 = Math.max(BB.y1, 160 + 30);
  const labels = top + caption("Each item can have its own branches");
  const css = `
.t{animation:grow 5s ease-out infinite}
@keyframes grow{0%{opacity:0;transform:translateY(-10px)}10%,86%{opacity:1;transform:translateY(0)}96%,100%{opacity:0}}`;
  files["tree"] = svg("Tree: one top item with branches below it, like folders inside folders", lines + nodes + labels, css);
}

// 6. Graph: cities float, traffic flows along the highlighted route
{
  resetBB();
  const p = iso(0, 0, 24);
  let b = ground(p, -0.5, -0.5, 6, 6);
  const city = [[0.5, 0.5, 1.4], [4, 0.6, 1], [2.2, 2.4, 1.8], [0.6, 4.2, 1.1], [4.2, 4, 1.4]];
  const roads = [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 4], [1, 4]];
  roads.forEach(([a, c]) => {
    const [x1, y1] = p(city[a][0] + 0.4, city[a][1] + 0.4, 0), [x2, y2] = p(city[c][0] + 0.4, city[c][1] + 0.4, 0);
    track(x1, y1); track(x2, y2);
    const hot = (a === 0 && c === 2) || (a === 2 && c === 4);
    b += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${hot ? "#10B981" : "#94A3B8"}" stroke-width="${hot ? 4 : 2.5}" stroke-linecap="round"/>`;
    if (hot) b += `<line class="flow" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="#ECFDF5" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 9"/>`;
  });
  [...city.keys()].sort((a, c) => city[a][0] + city[a][1] - (city[c][0] + city[c][1])).forEach((i) => {
    const [x, y, h] = city[i];
    b += `<g class="city" style="animation-delay:${(i * 0.5).toFixed(1)}s">${box(p, x, y, 0, 0.8, 0.8, h, i === 0 || i === 4 ? GREEN : BLUE)}</g>`;
  });
  b += caption("Anything connected to anything");
  const css = `
.flow{animation:flow 1.2s linear infinite}
@keyframes flow{to{stroke-dashoffset:-24}}
.city{animation:city 3.5s ease-in-out infinite}
@keyframes city{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`;
  files["graph"] = svg("Graph: cities connected by roads; the green path is one route", b, css);
}

// 7. Tallest: pillars rise, then a pointer walks down the line and stops at the tallest
{
  resetBB();
  const p = iso(0, 0, 16);
  const hs = [3, 4.2, 2.6, 5.4, 3.6, 4.6];
  const SP = 2;
  let b = ground(p, -0.4, -0.4, 6 * SP + 0.4, 1.8);
  let labels = "";
  const tops = [];
  hs.forEach((h, i) => {
    const x = i * SP, hot = i === 3;
    b += `<g class="pillar${hot ? " best" : ""}" style="animation-delay:${(i * 0.12).toFixed(2)}s">${box(p, x, 0, 0, 1, 1, h, hot ? GREEN : BLUE)}</g>`;
    const [tx, ty] = topC(p, x, 0, 0, 1, 1, h);
    tops.push([tx, ty]);
    labels += text(tx, ty - 10, String(Math.round(h * 30 + 60)), { size: 12, weight: 800, fill: hot ? "#059669" : "#1E40AF", attrs: `class="lbl" style="animation-delay:${(i * 0.12).toFixed(2)}s"` });
  });
  const [bx, by] = tops[3];
  labels += text(bx, by - 26, "tallest", { size: 12, weight: 800, fill: "#059669", attrs: 'class="crown"' });
  // pointer: a small down-triangle above each pillar top in turn
  const [x0, y0] = tops[0];
  track(x0 - 6, y0 - 44);
  const ptr = `<polygon class="ptr" points="${f(x0 - 6)},${f(y0 - 44)} ${f(x0 + 6)},${f(y0 - 44)} ${f(x0)},${f(y0 - 34)}" fill="#2563EB"/>`;
  const steps = tops.map(([x, y], i) => {
    const pct = 30 + i * 9; // 30%..75%
    return `${pct}%{transform:translate(${f(x - x0)}px,${f(y - y0)}px)}`;
  });
  labels += caption("Walk down the line once →", { fill: "#2563EB", weight: 700 });
  const css = `
.pillar{animation:rise 6s ease-out infinite;transform-origin:50% 100%}

.lbl{animation:lbl 6s ease-out infinite}
@keyframes lbl{0%,8%{opacity:0}14%,92%{opacity:1}100%{opacity:0}}
@keyframes rise{0%{transform:scaleY(.05);opacity:0}12%,92%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1);opacity:0}}
.ptr{animation:ptr 6s ease-in-out infinite}
@keyframes ptr{0%,24%{opacity:0;transform:translate(0,0)}28%{opacity:1}${steps.join("")}88%{opacity:1;transform:translate(${f(tops[5][0] - x0)}px,${f(tops[5][1] - y0)}px)}100%{opacity:0}}
.crown{animation:crown 6s ease-in-out infinite}
@keyframes crown{0%,58%{opacity:0}64%,92%{opacity:1}100%{opacity:0}}`;
  const body = STATIC ? b + labels.replace('class="crown"', "") + "" : b + ptr + labels;
  files["tallest"] = svg("Find the tallest: walk down the line once and remember the tallest so far", body, css);
}
}

// ===================== "What is an algorithm?" (Foundations step 1) =====================
// Objects are drawn with gaps between them so nothing overlaps its neighbour, even while moving.
// ---- shared by the lesson blocks below ----
const pct = (v) => `${(+v).toFixed(1)}%`;
// CSS for a label shown only between a% and z% of the loop. `first` labels also show from 96% (after the reset).
const shown = (cls, dur, a, z, first = false) =>
  `.${cls}{animation:${cls} ${dur}s linear infinite;opacity:${first ? 1 : 0}}@keyframes ${cls}{` +
  (first ? `0%,${pct(z)}{opacity:1}${pct(z + 0.2)},${pct(95.8)}{opacity:0}96%,100%{opacity:1}}` : `0%,${pct(a - 0.2)}{opacity:0}${pct(a)},${pct(z)}{opacity:1}${pct(z + 0.2)},100%{opacity:0}}`);

const STEEL = { top: "#F1F5F9", left: "#CBD5E1", right: "#94A3B8", edge: "#64748B" };
const PAPER = { top: "#FFFFFF", left: "#E2E8F0", right: "#CBD5E1", edge: "#94A3B8" };
const TEA = { top: "#FDE68A", left: "#FBBF24", right: "#F59E0B", edge: "#B45309" };
const WOOD = { top: "#E7C9A0", left: "#C8A27A", right: "#A47E57", edge: "#7C5A3A" };
const CHINA = { top: "#FFFFFF", left: "#F8FAFC", right: "#E2E8F0", edge: "#94A3B8" };
const GLASS = { top: "#ECFDF5", left: "#D1FAE5", right: "#A7F3D0", edge: "#059669" };

if (LESSON === "algorithms") {
  // An upright cylinder standing on (x, y, z): side as a polygon (no paths, so the Penpot copy imports cleanly).
  const cyl = (p, x, y, z, r, h, col, attrs = "") => {
    const rx = r * Math.SQRT2 * C * p.s, ry = r * Math.SQRT2 * S * p.s;
    const [bx, by] = p(x, y, z), [tx, ty] = p(x, y, z + h);
    const arc = [];
    for (let k = 0; k <= 16; k++) { const a = (Math.PI * k) / 16; arc.push([bx + rx * Math.cos(a), by + ry * Math.sin(a)]); }
    const side = [[tx + rx, ty], ...arc, [tx - rx, ty]];
    track(tx - rx, ty - ry); track(tx + rx, ty - ry);
    const st = `stroke="${col.edge}" stroke-width="1" stroke-linejoin="round"`;
    // two-tone side: light on the left half, darker on the right half
    const leftHalf = [[tx, ty + ry], ...arc.slice(8), [tx - rx, ty]];
    return `<g ${attrs}><polygon points="${pts(side)}" fill="${col.right}" ${st}/><polygon points="${pts(leftHalf)}" fill="${col.left}" stroke="none"/><polygon points="${pts(side)}" fill="none" ${st}/><ellipse cx="${f(tx)}" cy="${f(ty)}" rx="${f(rx)}" ry="${f(ry)}" fill="${col.top}" ${st}/></g>`;
  };
  // soft contact shadow on the ground
  const shadow = (p, x, y, r) => {
    const [sx, sy] = p(x + 0.12, y + 0.12, 0);
    return `<ellipse cx="${f(sx)}" cy="${f(sy)}" rx="${f(r * Math.SQRT2 * C * p.s * 1.05)}" ry="${f(r * Math.SQRT2 * S * p.s * 1.05)}" fill="#0F172A" fill-opacity="0.08"/>`;
  };
  const poly = (ptsArr, fill, extra = "") => `<polygon points="${pts(ptsArr)}" fill="${fill}" ${extra}/>`;
  const line = (ptsArr, col, w = 2, extra = "") => `<polyline points="${pts(ptsArr)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

  // 1. Recipe: four stations (kettle, tea, hourglass, cup) that light up in order
  {
    resetBB();
    const p = iso(0, 0, 22);
    const D = 2.5, Z0 = 0.22, DUR = 6;
    const at = (i) => [i * D, -i * D]; // left to right on screen
    const on = (i) => 6 + i * 21; // % when station i lights
    const names = ["1. Boil water", "2. Add tea", "3. Wait 3 min", "4. Pour"];
    let b = "";
    let css = "";
    names.forEach((nm, i) => {
      const [x, y] = at(i);
      // platform (grey), green overlay that lights up
      b += shadow(p, x, y, 1.0) + cyl(p, x, y, 0, 1.0, Z0, STEEL);
      b += `<g class="lit${i}">${cyl(p, x, y, 0, 1.0, Z0, GREEN)}</g>`;
      css += `.lit${i}{animation:lit${i} ${DUR}s ease-in-out infinite;opacity:0}@keyframes lit${i}{0%,${pct(on(i) - 1)}{opacity:0}${pct(on(i) + 3)},92%{opacity:1}97%,100%{opacity:0}}`;
      // arrow on the ground to the next station
      const [lx, ly] = p(x, y, 0);
      const r1 = 1.0 * Math.SQRT2 * C * p.s;
      if (i < 3) b += arrow(lx + r1 + 5, ly, lx + 2 * D * C * p.s - r1 - 5, ly, "#94A3B8");
      b += text(lx, ly + 1.0 * Math.SQRT2 * S * p.s + 20, nm, { size: 12, weight: 700, fill: "#334155" });
    });
    // station 1: kettle with steam
    {
      const [x, y] = at(0);
      b += cyl(p, x, y, Z0, 0.5, 0.8, STEEL) + cyl(p, x, y, Z0 + 0.8, 0.22, 0.1, STEEL) + cyl(p, x, y, Z0 + 0.9, 0.08, 0.08, { ...STEEL, top: "#475569" });
      const [cx, cy] = p(x, y, Z0 + 0.8), rx = 0.5 * Math.SQRT2 * C * p.s;
      b += line([[cx - rx * 0.7, cy - 2], [cx - rx * 0.5, cy - 16], [cx + rx * 0.5, cy - 16], [cx + rx * 0.7, cy - 2]], "#475569", 3);
      const [sx, sy] = p(x, y, Z0 + 0.45);
      b += poly([[sx + rx - 2, sy - 2], [sx + rx + 16, sy - 14], [sx + rx + 18, sy - 10], [sx + rx - 2, sy + 6]], "#94A3B8", 'stroke="#64748B" stroke-width="1"');
      [0, 1, 2].forEach((k) => {
        const bx = sx + rx + 16 + k * 6, by = sy - 18;
        b += line([[bx, by], [bx - 3, by - 6], [bx + 2, by - 12], [bx - 1, by - 18]], "#94A3B8", 2, `class="steam" style="animation-delay:${(k * 0.4).toFixed(1)}s"`);
      });
      css += `.steam{animation:steam 1.8s ease-out infinite;opacity:0}@keyframes steam{0%{opacity:0;transform:translateY(4px)}30%{opacity:.9}100%{opacity:0;transform:translateY(-10px)}}`;
    }
    // station 2: box of tea
    {
      const [x, y] = at(1);
      b += box(p, x - 0.45, y - 0.45, Z0, 0.9, 0.9, 0.75, TEA);
      const [tx, ty] = topC(p, x - 0.45, y - 0.45, Z0, 0.9, 0.9, 0.75);
      b += text(tx, ty + 4, "TEA", { size: 11, weight: 800, fill: "#92400E" });
    }
    // station 3: hourglass, sand runs while the step is lit
    {
      const [x, y] = at(2);
      b += cyl(p, x, y, Z0, 0.5, 0.1, WOOD);
      const [gx, gyB] = p(x, y, Z0 + 0.1), [, gyT] = p(x, y, Z0 + 1.6);
      const w = 13, mid = (gyB + gyT) / 2;
      b += poly([[gx - w, gyT], [gx + w, gyT], [gx + 2, mid], [gx + w, gyB], [gx - w, gyB], [gx - 2, mid]], "#FFFFFF", 'fill-opacity="0.55" stroke="#94A3B8" stroke-width="1.2"');
      b += `<g class="sandTop">${poly([[gx - w + 3, gyT + 4], [gx + w - 3, gyT + 4], [gx, mid - 1]], "#F59E0B")}</g>`;
      b += `<g class="sandBot">${poly([[gx - w + 2, gyB - 1], [gx + w - 2, gyB - 1], [gx, gyB - 12]], "#F59E0B")}</g>`;
      b += cyl(p, x, y, Z0 + 1.6, 0.5, 0.1, WOOD);
      const s0 = on(2), s1 = on(2) + 16;
      css += `.sandTop{animation:sandTop ${DUR}s linear infinite;transform-origin:50% 0}@keyframes sandTop{0%,${pct(s0)}{transform:scaleY(1)}${pct(s1)},96%{transform:scaleY(.08)}100%{transform:scaleY(1)}}`;
      css += `.sandBot{animation:sandBot ${DUR}s linear infinite;transform-origin:50% 100%}@keyframes sandBot{0%,${pct(s0)}{transform:scaleY(.15)}${pct(s1)},96%{transform:scaleY(1)}100%{transform:scaleY(.15)}}`;
    }
    // station 4: cup on a saucer, fills with tea
    {
      const [x, y] = at(3);
      b += cyl(p, x, y, Z0, 0.68, 0.06, CHINA) + cyl(p, x, y, Z0 + 0.06, 0.42, 0.55, CHINA);
      const [cx, cy] = p(x, y, Z0 + 0.61), rx = 0.42 * Math.SQRT2 * C * p.s, ry = 0.42 * Math.SQRT2 * S * p.s;
      b += `<ellipse class="teaFill" cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx * 0.82)}" ry="${f(ry * 0.8)}" fill="#B45309"/>`;
      const [hx, hy] = p(x, y, Z0 + 0.35);
      b += line([[hx + rx - 1, hy - 7], [hx + rx + 8, hy - 6], [hx + rx + 9, hy + 2], [hx + rx - 1, hy + 4]], "#94A3B8", 3);
      css += `.teaFill{animation:teaFill ${DUR}s ease-in-out infinite;opacity:0}@keyframes teaFill{0%,${pct(on(3))}{opacity:0}${pct(on(3) + 6)},92%{opacity:1}97%,100%{opacity:0}}`;
    }
    b += caption("The same steps, in the same order, every time");
    files["recipe"] = svg("An algorithm is a recipe: boil water, add tea, wait, pour, in that order", b, css);
  }

  // Name cards lying on a table, 2 rows of 8, sorted A to T. Card 10 is "M" for Meera.
  const LETTERS = ["A", "B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T"];
  const TARGET = 10;
  const cardGrid = (p) => {
    // column -> right on screen (world 1,-1); row -> down on screen (world 1,1)
    const at = (i) => { const c = i % 8, r = Math.floor(i / 8); return { x: c * 1.1 + r * 2.3, y: -c * 1.1 + r * 2.3 }; };
    const order = [...LETTERS.keys()].sort((a, c) => at(a).x + at(a).y - (at(c).x + at(c).y));
    let s = "";
    const tops = [];
    order.forEach((i) => {
      const { x, y } = at(i);
      const hot = i === TARGET;
      const [tx, ty] = topC(p, x, y, 0, 1, 1, 0.12);
      tops[i] = [tx, ty];
      s += `<g class="cd${i}">${box(p, x, y, 0, 1, 1, 0.12, PAPER)}${hot ? `<g class="found">${box(p, x, y, 0, 1, 1, 0.12, GREEN)}</g>` : ""}${text(tx, ty + 5, LETTERS[i], { size: 13, weight: 800, fill: hot ? "#065F46" : "#334155" })}</g>`;
    });
    return { s, tops };
  };
  const pointer = (x, y, cls) => {
    track(x - 7, y - 34);
    return `<polygon class="${cls}" points="${f(x - 7)},${f(y - 34)} ${f(x + 7)},${f(y - 34)} ${f(x)},${f(y - 22)}" fill="#2563EB"/>`;
  };
  const counter = (x, y, wins) => wins.map((_, i) => text(x, y, `${i + 1} look${i ? "s" : ""}`, { size: 13, weight: 800, fill: "#2563EB", attrs: `class="c${i}"` })).join("");
  const counterCss = (wins, dur) => wins.map(([a, z], i) => shown(`c${i}`, dur, a, i < wins.length - 1 ? z - 0.3 : z)).join("");
  const fadeOut = (i, t, dur) => `.cd${i}{animation:cd${i} ${dur}s ease-in-out infinite}@keyframes cd${i}{0%,${pct(t)}{opacity:1}${pct(t + 3)},92%{opacity:.28}97%,100%{opacity:1}}`;
  const foundCss = (t, dur) =>
    `.found{animation:found ${dur}s ease-in-out infinite;opacity:0}@keyframes found{0%,${pct(t)}{opacity:0}${pct(t + 3)},92%{opacity:1}97%,100%{opacity:0}}` +
    `.cd${TARGET}{animation:lift ${dur}s ease-in-out infinite}@keyframes lift{0%,${pct(t)}{transform:translateY(0)}${pct(t + 4)},90%{transform:translateY(-7px)}96%,100%{transform:translateY(0)}}`;

  // 2. Way 1: check every card in order
  {
    resetBB();
    const p = iso(0, 0, 21);
    const DUR = 8;
    const { s, tops } = cardGrid(p);
    const lookAt = (k) => 5 + k * 6.6; // 11 looks: 5% .. 71%
    let css = "";
    const [x0, y0] = tops[0];
    let kf = `0%,${pct(lookAt(0) - 0.1)}{opacity:0;transform:translate(0,0)}`;
    const wins = [];
    for (let k = 0; k <= TARGET; k++) {
      kf += `${pct(lookAt(k))}{opacity:1;transform:translate(${f(tops[k][0] - x0)}px,${f(tops[k][1] - y0)}px)}`;
      if (k < TARGET) css += fadeOut(k, lookAt(k) + 2, DUR);
      wins.push([lookAt(k), k === TARGET ? 92 : lookAt(k + 1) - 0.1]);
    }
    for (let k = TARGET + 1; k < LETTERS.length; k++) css += fadeOut(k, lookAt(TARGET) + 2, DUR);
    kf += `92%{opacity:1;transform:translate(${f(tops[TARGET][0] - x0)}px,${f(tops[TARGET][1] - y0)}px)}93%,100%{opacity:0}`;
    css += `.p1{animation:p1 ${DUR}s steps(1,end) infinite}@keyframes p1{${kf}}` + foundCss(lookAt(TARGET), DUR) + counterCss(wins, DUR);
    const head = text(BB.x0 + 4, BB.y0 - 30, "Looking for: Meera", { size: 13, weight: 800, fill: "#334155", anchor: "start" });
    const cnt = counter(BB.x1 - 30, BB.y0 - 30, wins);
    const cap = caption("Check every card in order: 11 looks to reach M");
    files["phone-book-scan"] = svg("Way 1: check every name card in order until Meera is found", s + head + (STATIC ? "" : pointer(x0, y0, "p1") + cnt) + cap, css);
  }

  // 3. Way 2: open the middle, rule out half each time
  {
    resetBB();
    const p = iso(0, 0, 21);
    const DUR = 8;
    const { s, tops } = cardGrid(p);
    // looks: K (8) -> M is later; P (12) -> M is earlier; M (10) found
    const looks = [8, 12, 10];
    const lookAt = (k) => 8 + k * 22;
    const ruledOut = [[0, 8], [12, 15]]; // after look 0 and look 1
    let css = "";
    ruledOut.forEach(([a, z], k) => { for (let i = a; i <= z; i++) css += fadeOut(i, lookAt(k) + 6, DUR); });
    for (const i of [9, 11]) css += fadeOut(i, lookAt(2) + 4, DUR);
    const [x0, y0] = tops[looks[0]];
    let kf = `0%,${pct(lookAt(0) - 0.1)}{opacity:0;transform:translate(0,0)}`;
    looks.forEach((m, k) => (kf += `${pct(lookAt(k))}{opacity:1;transform:translate(${f(tops[m][0] - x0)}px,${f(tops[m][1] - y0)}px)}`));
    kf += `92%{opacity:1;transform:translate(${f(tops[TARGET][0] - x0)}px,${f(tops[TARGET][1] - y0)}px)}93%,100%{opacity:0}`;
    const wins = looks.map((_, k) => [lookAt(k), k === looks.length - 1 ? 92 : lookAt(k + 1) - 0.1]);
    css += `.p2{animation:p2 ${DUR}s steps(1,end) infinite}@keyframes p2{${kf}}` + foundCss(lookAt(2), DUR) + counterCss(wins, DUR);
    const head = text(BB.x0 + 4, BB.y0 - 30, "Looking for: Meera", { size: 13, weight: 800, fill: "#334155", anchor: "start" });
    const cnt = counter(BB.x1 - 30, BB.y0 - 30, wins);
    const cap = caption("Open the middle, rule out half: 3 looks to reach M");
    files["phone-book-halve"] = svg("Way 2: open the middle card and rule out half each time; Meera is found in three looks", s + head + (STATIC ? "" : pointer(x0, y0, "p2") + cnt) + cap, css);
  }

  // 4. Add up a list: spaced number blocks hop one by one into a glass jar that shows the total
  {
    resetBB();
    const p = iso(0, 0, 22);
    const DUR = 6.5;
    const vals = [3, 1, 4, 1, 5];
    const SP = 1.8, JX = 5 * SP + 1.0, JY = 0.45;
    let b = ground(p, -0.6, -0.6, JX + 1.8, 2.3);
    b += shadow(p, JX, JY, 0.85) + cyl(p, JX, JY, 0, 0.85, 1.2, GLASS);
    const [jx, jy] = p(JX, JY, 1.2);
    let css = "", blocks = "";
    const hopAt = (i) => 8 + i * 16;
    vals.forEach((v, i) => {
      const x = i * SP;
      const [bx, by] = topC(p, x, 0, 0, 0.9, 0.9, 0.9);
      blocks += `<g class="n${i}">${box(p, x, 0, 0, 0.9, 0.9, 0.9, BLUE)}${text(bx, by + 5, v, { size: 14, weight: 800, fill: "#1E3A8A" })}</g>`;
      const dx = jx - bx, dy = jy - by, t = hopAt(i), up = -64 - Math.max(0, -dy);
      css += `.n${i}{animation:n${i} ${DUR}s ease-in-out infinite}@keyframes n${i}{0%,${pct(t)}{transform:translate(0,0);opacity:1}${pct(t + 3)}{transform:translate(0,${f(up)}px);opacity:1}${pct(t + 7)}{transform:translate(${f(dx)}px,${f(up)}px);opacity:1}${pct(t + 9)}{transform:translate(${f(dx)}px,${f(dy - 30)}px);opacity:0}93%{transform:translate(${f(dx)}px,${f(dy - 30)}px);opacity:0}96%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}}`;
      b += shadow(p, x + 0.45, 0.45, 0.6);
    });
    track(jx, jy - 96);
    const totals = [0, 3, 4, 8, 9, 14];
    let tot = "";
    totals.forEach((v, k) => {
      const a = k === 0 ? 0 : hopAt(k - 1) + 9, z = k === totals.length - 1 ? 94 : hopAt(k) + 9;
      tot += text(jx, jy + 6, v, { size: 17, weight: 800, fill: "#065F46", attrs: `class="t${k}"` });
      css += shown(`t${k}`, DUR, a, k === totals.length - 1 ? z : z - 0.4, k === 0);
    });
    const [rx, ry] = p(JX + 0.85, JY, 1.2);
    const label = text(rx + 12, ry + 4, "total", { size: 12, weight: 800, fill: "#059669", anchor: "start" });
    const cap = caption("5 numbers → 5 additions, on any computer");
    const staticTot = text(jx, jy + 6, 14, { size: 17, weight: 800, fill: "#065F46" });
    files["sum"] = svg("Adding up a list: each number is added to the total once", b + blocks + (STATIC ? staticTot : tot) + label + cap, css);
  }

  // 5. What n means: n doubles; the n-step row doubles, the log n tower adds one block
  {
    resetBB();
    const p = iso(0, 0, 13);
    const q = iso(236, 0, 13);
    q.s = 13;
    const DUR = 7.5;
    const showAt = (ph) => [0, 33, 66][ph];
    const fade = (cls, ph) =>
      ph === 0 ? "" : `.${cls}{animation:${cls} ${DUR}s ease-out infinite;opacity:0}@keyframes ${cls}{0%,${pct(showAt(ph) + 1)}{opacity:0;transform:translateY(-10px)}${pct(showAt(ph) + 6)},94%{opacity:1;transform:translateY(0)}98%,100%{opacity:0}}`;
    let b = ground(p, -0.5, -0.5, 16 * 1.15 + 0.3, 1.7);
    let css = "", row = "", tower = "";
    for (let i = 0; i < 16; i++) {
      const ph = i < 4 ? 0 : i < 8 ? 1 : 2;
      row += `<g class="r${i}">${box(p, i * 1.15, 0, 0, 0.7, 0.7, 0.7, BLUE)}</g>`;
      css += fade(`r${i}`, ph);
    }
    b += ground(q, -0.6, -0.6, 2, 2);
    for (let j = 0; j < 4; j++) {
      const ph = j < 2 ? 0 : j === 2 ? 1 : 2;
      tower += `<g class="w${j}">${box(q, 0, 0, j * 0.85, 0.8, 0.8, 0.75, GREEN)}</g>`;
      css += fade(`w${j}`, ph);
    }
    const [lx, ly] = p(8.5, 2.4, 0);
    const [wx, wy] = q(0.4, 1.9, 0);
    const lab = (k, n, lg) => {
      const a = showAt(k), z = k === 2 ? 94 : showAt(k + 1) - 0.4;
      css += shown(`l${k}`, DUR, a, z, k === 0);
      return `<g class="l${k}">${text(lx, ly + 22, `n = ${n} → ${n} steps`, { size: 13, weight: 800, fill: "#1D4ED8" })}${text(wx, wy + 22, `log n → ${lg} steps`, { size: 13, weight: 800, fill: "#047857" })}</g>`;
    };
    const labels = STATIC
      ? text(lx, ly + 22, "n = 16 → 16 steps", { size: 13, weight: 800, fill: "#1D4ED8" }) + text(wx, wy + 22, "log n → 4 steps", { size: 13, weight: 800, fill: "#047857" })
      : lab(0, 4, 2) + lab(1, 8, 3) + lab(2, 16, 4);
    const cap = caption("Double n: the row doubles, the tower grows by one");
    files["n-grows"] = svg("As n doubles, n steps doubles but log n steps grows by only one", b + row + tower + labels + cap, css);
  }
}

// ===================== "Reading loops" (Foundations step 2) =====================
if (LESSON === "reading-loops") {
  const RED = { top: "#FECACA", left: "#F87171", right: "#EF4444", edge: "#B91C1C" };
  const SKY = { top: "#CFFAFE", left: "#67E8F9", right: "#22D3EE", edge: "#0E7490" };
  // A flat tile / short block in a grid laid out across the screen: col -> right, row -> down.
  const cell = (col, row, gap, rowGap = gap) => ({ x: col * gap + row * rowGap, y: -col * gap + row * rowGap });
  const pointer = (x, y, cls) => {
    track(x - 7, y - 34);
    return `<polygon class="${cls}" points="${f(x - 7)},${f(y - 34)} ${f(x + 7)},${f(y - 34)} ${f(x)},${f(y - 22)}" fill="#2563EB"/>`;
  };
  // stacked labels: label k is visible in wins[k] = [a, z] (% of the loop)
  const stackedText = (x, y, labels, wins, dur, o, prefix) => {
    let s = "", css = "";
    labels.forEach((t, k) => {
      s += text(x, y, t, { ...o, attrs: `class="${prefix}${k}"` });
      const [a, z] = wins[k];
      css += shown(`${prefix}${k}`, dur, a, k < labels.length - 1 ? z - 0.6 : z, k === 0 && a === 0);
    });
    return { s, css };
  };
  const phaseAppear = (cls, at, dur) =>
    `.${cls}{animation:${cls} ${dur}s ease-out infinite;opacity:0}@keyframes ${cls}{0%,${pct(at + 0.5)}{opacity:0;transform:translateY(-8px)}${pct(at + 5)},94%{opacity:1;transform:translateY(0)}98%,100%{opacity:0}}`;

  // 1. Big-O shapes: as n goes 2 -> 4 -> 8, count the steps of O(1), O(log n), O(n), O(n²)
  {
    resetBB();
    const p = iso(0, 0, 15);
    const DUR = 9, PH = [0, 33, 66], NS = [2, 4, 8];
    const T = 0.56, G = 0.64; // block size, block pitch
    const plural = (c) => `${c} step${c === 1 ? "" : "s"}`;
    let b = "", css = "";
    // four groups placed left to right on screen
    const groups = [
      { key: "o1", name: "O(1)", col: GREEN, steps: () => [[0, 0]], count: () => 1 },
      { key: "olog", name: "O(log n)", col: SKY, steps: (n) => [...Array(Math.log2(n)).keys()].map((k) => [0, k]), count: (n) => Math.log2(n) },
      { key: "on", name: "O(n)", col: BLUE, steps: (n) => [...Array(n).keys()].map((k) => [k, 0]), count: (n) => n },
      { key: "on2", name: "O(n²)", col: RED, steps: (n) => [...Array(n * n).keys()].map((k) => [k % n, Math.floor(k / n)]), count: (n) => n * n },
    ];
    const OX = [0, 2.6, 5.6, 11.2]; // group origins along the screen row (units of the (1,-1) direction)
    const labelsY = [];
    groups.forEach((g, gi) => {
      const ox = OX[gi], base = { x: ox, y: -ox };
      const outer = BB; resetBB(); // measure this group on its own, then merge
      // every tile this group ever shows, with the phase it first appears in
      const firstPhase = new Map();
      NS.forEach((n, ph) => g.steps(n).forEach(([a, r]) => { const k = `${a},${r}`; if (!firstPhase.has(k)) firstPhase.set(k, ph); }));
      const tiles = [...firstPhase.entries()].map(([k, ph]) => { const [a, r] = k.split(",").map(Number); return { a, r, ph }; });
      // [a, r]: a runs down-right along the floor (world +x), r stacks upward (z); draw back to front, bottom to top
      tiles.sort((u, v) => u.a - v.a || u.r - v.r);
      tiles.forEach(({ a, r, ph }, ti) => {
        const cls = `${g.key}${ti}`;
        b += `<g class="${cls}">${box(p, base.x + a * G, base.y, r * G, T, T, T, g.col)}</g>`;
        if (ph > 0) css += phaseAppear(cls, PH[ph], DUR);
      });
      labelsY.push([(BB.x0 + BB.x1) / 2, BB.y1]);
      const mine = BB; BB = outer; track(mine.x0, mine.y0); track(mine.x1, mine.y1);
    });
    // names and step counts under each group (same baseline)
    const baseY = BB.y1 + 22;
    groups.forEach((g, gi) => {
      const [lx] = labelsY[gi];
      b += text(lx, baseY, g.name, { size: 14, weight: 800, fill: g.col.edge });
      const st = stackedText(lx, baseY + 18, NS.map((n) => plural(g.count(n))), PH.map((a, k) => [a, k < 2 ? PH[k + 1] : 94]), DUR, { size: 12, weight: 700, fill: "#475569" }, `${g.key}c`);
      b += STATIC ? text(lx, baseY + 18, plural(g.count(8)), { size: 12, weight: 700, fill: "#475569" }) : st.s;
      css += st.css;
    });
    const nl = stackedText((BB.x0 + BB.x1) / 2, BB.y0 - 16, NS.map((n) => `n = ${n}`), PH.map((a, k) => [a, k < 2 ? PH[k + 1] : 94]), DUR, { size: 15, weight: 800, fill: "#0F172A" }, "nn");
    b += STATIC ? text((BB.x0 + BB.x1) / 2, BB.y0 - 16, "n = 8", { size: 15, weight: 800, fill: "#0F172A" }) : nl.s;
    css += nl.css;
    files["big-o-shapes"] = svg("As n goes 2, 4, 8: O(1) stays 1 step, O(log n) adds one step, O(n) doubles, O(n²) grows into a square", b, css);
  }

  // Row of n items across the screen (used by one-loop, halving, no-loop)
  const rowItems = (p, n, gap, colOf, labelOf, size = 0.6) => {
    let s = "";
    const tops = [];
    for (let i = 0; i < n; i++) {
      const { x, y } = cell(i, 0, gap);
      const [tx, ty] = topC(p, x, y, 0, size, size, 0.45);
      tops.push([tx, ty]);
      s += `<g class="it${i}">${box(p, x, y, 0, size, size, 0.45, colOf(i))}${labelOf ? text(tx, ty + 4, labelOf(i), { size: 11, weight: 800, fill: "#1E3A8A" }) : ""}</g>`;
    }
    return { s, tops };
  };

  // 2. One loop: visit each of 8 items once
  {
    resetBB();
    const p = iso(0, 0, 21);
    const DUR = 7, N = 8, vals = [7, 3, 9, 1, 4, 8, 2, 6];
    const { s, tops } = rowItems(p, N, 1.0, () => BLUE, (i) => vals[i], 0.8);
    let css = "", lit = "";
    const at = (k) => 6 + k * 9.5;
    tops.forEach(([tx, ty], i) => {
      const { x, y } = cell(i, 0, 1.0);
      lit += `<g class="v${i}">${box(p, x, y, 0, 0.8, 0.8, 0.45, GREEN)}${text(tx, ty + 4, vals[i], { size: 11, weight: 800, fill: "#065F46" })}</g>`;
      css += `.v${i}{animation:v${i} ${DUR}s ease-in-out infinite;opacity:0}@keyframes v${i}{0%,${pct(at(i))}{opacity:0}${pct(at(i) + 2)},92%{opacity:1}97%,100%{opacity:0}}`;
    });
    const [x0, y0] = tops[0];
    let kf = `0%,${pct(at(0) - 0.1)}{opacity:0;transform:translate(0,0)}`;
    tops.forEach(([x, y], k) => (kf += `${pct(at(k))}{opacity:1;transform:translate(${f(x - x0)}px,${f(y - y0)}px)}`));
    kf += `92%{opacity:1;transform:translate(${f(tops[N - 1][0] - x0)}px,${f(tops[N - 1][1] - y0)}px)}93%,100%{opacity:0}`;
    css += `.ptr{animation:ptr ${DUR}s steps(1,end) infinite}@keyframes ptr{${kf}}`;
    const ptr = pointer(x0, y0, "ptr");
    const cnt = stackedText((BB.x0 + BB.x1) / 2, BB.y0 - 14, vals.map((_, k) => `${k + 1} step${k ? "s" : ""}`), vals.map((_, k) => [at(k), k < N - 1 ? at(k + 1) : 92]), DUR, { size: 14, weight: 800, fill: "#2563EB" }, "c");
    css += cnt.css;
    const lab = text((BB.x0 + BB.x1) / 2, BB.y1 + 22, "n = 8 items → the loop body runs 8 times", { size: 13, weight: 700, fill: "#334155" });
    files["one-loop"] = svg("One loop: a pointer visits each of 8 items once, 8 steps in total", s + (STATIC ? "" : lit + ptr + cnt.s) + lab, css);
  }

  // 3. Loop inside a loop: 4 x 4 grid, inner pointer sweeps each row
  {
    resetBB();
    const p = iso(0, 0, 22);
    const DUR = 10, N = 4, names = ["A", "B", "C", "D"], GAP = 1.15, RG = 2.0;
    const at = (k) => 6 + k * 5.3; // 16 visits: 6% .. 85.5%
    let s = "", lit = "", css = "";
    const tops = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const { x, y } = cell(c, r, GAP, RG);
      const [tx, ty] = topC(p, x, y, 0, 0.9, 0.9, 0.2);
      tops.push([tx, ty]);
      s += box(p, x, y, 0, 0.9, 0.9, 0.2, PAPER) + text(tx, ty + 4, names[r] + names[c], { size: 10, weight: 700, fill: "#94A3B8" });
      const k = r * N + c;
      lit += `<g class="g${k}">${box(p, x, y, 0, 0.9, 0.9, 0.2, GREEN)}${text(tx, ty + 4, names[r] + names[c], { size: 10, weight: 800, fill: "#065F46" })}</g>`;
      css += `.g${k}{animation:g${k} ${DUR}s ease-in-out infinite;opacity:0}@keyframes g${k}{0%,${pct(at(k))}{opacity:0}${pct(at(k) + 1.5)},92%{opacity:1}97%,100%{opacity:0}}`;
    }
    // row labels (outer loop i) on the left, column labels (inner loop j) on top
    for (let r = 0; r < N; r++) { const { x, y } = cell(-1, r, GAP, RG); const [lx, ly] = topC(p, x, y, 0, 0.9, 0.9, 0); s += text(lx, ly + 4, names[r], { size: 12, weight: 800, fill: "#7C3AED" }); }
    for (let c = 0; c < N; c++) { const { x, y } = cell(c, -1.45, GAP, RG); const [lx, ly] = topC(p, x, y, 0, 0.9, 0.9, 0); s += text(lx, ly + 4, names[c], { size: 12, weight: 800, fill: "#2563EB" }); }
    // outer-loop row marker (purple bar at the left of the current row)
    const [rx0, ry0] = topC(p, cell(-1, 0, GAP, RG).x, cell(-1, 0, GAP, RG).y, 0, 0.9, 0.9, 0);
    let okf = "";
    for (let r = 0; r < N; r++) { const [rx, ry] = topC(p, cell(-1, r, GAP, RG).x, cell(-1, r, GAP, RG).y, 0, 0.9, 0.9, 0); okf += `${pct(at(r * N))}{opacity:1;transform:translate(${f(rx - rx0)}px,${f(ry - ry0)}px)}`; }
    const row = `<rect class="orow" x="${f(rx0 - 13)}" y="${f(ry0 - 12)}" width="26" height="22" rx="7" fill="#7C3AED" fill-opacity="0.16" stroke="#7C3AED"/>`;
    track(rx0 - 13, ry0 - 12);
    css += `.orow{animation:orow ${DUR}s steps(1,end) infinite}@keyframes orow{0%,${pct(at(0) - 0.1)}{opacity:0}${okf}92%{opacity:1}93%,100%{opacity:0}}`;
    const [x0, y0] = tops[0];
    let kf = `0%,${pct(at(0) - 0.1)}{opacity:0;transform:translate(0,0)}`;
    tops.forEach(([x, y], k) => (kf += `${pct(at(k))}{opacity:1;transform:translate(${f(x - x0)}px,${f(y - y0)}px)}`));
    kf += `92%{opacity:1;transform:translate(${f(tops[15][0] - x0)}px,${f(tops[15][1] - y0)}px)}93%,100%{opacity:0}`;
    css += `.ptr{animation:ptr ${DUR}s steps(1,end) infinite}@keyframes ptr{${kf}}`;
    const ptr = pointer(x0, y0, "ptr");
    const cnt = stackedText((BB.x0 + BB.x1) / 2, BB.y0 - 14, tops.map((_, k) => `${k + 1} step${k ? "s" : ""}`), tops.map((_, k) => [at(k), k < 15 ? at(k + 1) : 92]), DUR, { size: 14, weight: 800, fill: "#2563EB" }, "c");
    css += cnt.css;
    const lab = text((BB.x0 + BB.x1) / 2, BB.y1 + 22, "4 items → each pairs with all 4 → 4 × 4 = 16 steps", { size: 13, weight: 700, fill: "#334155" });
    files["nested-loop"] = svg("Loop inside a loop: for each of 4 rows the inner loop visits all 4 columns, 16 steps in total", s + (STATIC ? "" : lit + row + ptr + cnt.s) + lab, css);
  }

  // 4. Halving: 16 -> 8 -> 4 -> 2 -> 1
  {
    resetBB();
    const p = iso(0, 0, 17);
    const DUR = 8, N = 16, TGT = 11;
    const { s, tops } = rowItems(p, N, 0.68, (i) => (i === TGT ? GREEN : BLUE), null, 0.55);
    // kept ranges after each halving
    const R = [[0, 16], [8, 16], [8, 12], [10, 12], [11, 12]];
    const at = (k) => 8 + k * 18; // halving k happens at at(k)
    let css = "";
    for (let i = 0; i < N; i++) {
      if (i === TGT) continue;
      const k = R.findIndex(([a, z]) => i < a || i >= z); // first range that drops it
      const t = at(k - 1) + 4;
      css += `.it${i}{animation:it${i} ${DUR}s ease-in-out infinite}@keyframes it${i}{0%,${pct(t)}{opacity:1;transform:translateY(0)}${pct(t + 4)},92%{opacity:.15;transform:translateY(8px)}97%,100%{opacity:1;transform:translateY(0)}}`;
    }
    css += `.it${TGT}{animation:lift ${DUR}s ease-in-out infinite}@keyframes lift{0%,${pct(at(3) + 4)}{transform:translateY(0)}${pct(at(3) + 8)},90%{transform:translateY(-8px)}96%,100%{transform:translateY(0)}}`;
    // a cut line at the middle of the current range, each step
    let cuts = "";
    R.slice(0, 4).forEach(([a, z], k) => {
      const m = (a + z) / 2;
      const [cx, cy] = topC(p, cell(m - 0.5, 0, 0.68).x, cell(m - 0.5, 0, 0.68).y, 0, 0.55, 0.55, 0.45);
      const cx2 = (cx + tops[Math.min(m, N - 1)][0]) / 2;
      cuts += `<line class="cut${k}" x1="${f(cx2)}" y1="${f(cy - 26)}" x2="${f(cx2)}" y2="${f(cy + 26)}" stroke="#DC2626" stroke-width="2" stroke-dasharray="4 3"/>`;
      track(cx2, cy - 26); track(cx2, cy + 26);
      css += shown(`cut${k}`, DUR, at(k) - 3, at(k) + 5);
    });
    const left = ["16 left", "8 left", "4 left", "2 left", "1 left: found"];
    const steps = ["start", "step 1", "step 2", "step 3", "step 4"];
    const wins = left.map((_, k) => [k === 0 ? 0 : at(k - 1) + 6, k < 4 ? at(k) + 6 : 94]);
    const top1 = stackedText((BB.x0 + BB.x1) / 2, BB.y0 - 30, steps, wins, DUR, { size: 14, weight: 800, fill: "#2563EB" }, "s");
    const top2 = stackedText((BB.x0 + BB.x1) / 2, BB.y0 - 12, left, wins, DUR, { size: 13, weight: 700, fill: "#334155" }, "l");
    css += top1.css + top2.css;
    const lab = text((BB.x0 + BB.x1) / 2, BB.y1 + 22, "16 → 8 → 4 → 2 → 1: four halvings, so log₂ 16 = 4 steps", { size: 13, weight: 700, fill: "#334155" });
    const stat = text((BB.x0 + BB.x1) / 2, BB.y0 - 12, "16 items", { size: 13, weight: 700, fill: "#334155" });
    files["halving"] = svg("Halving: 16 items, keep half each step, one item left after 4 steps", s + (STATIC ? stat : cuts + top1.s + top2.s) + lab, css);
  }

  // 5. No loop: the row grows 4 -> 8 -> 16, reading a[0] is always one step
  {
    resetBB();
    const p = iso(0, 0, 17);
    const DUR = 8, PH = [0, 33, 66], NS = [4, 8, 16];
    const { s: row, tops } = rowItems(p, 16, 0.68, (i) => (i === 0 ? GREEN : BLUE), (i) => i, 0.55);
    let css = "";
    for (let i = 4; i < 16; i++) css += phaseAppear(`it${i}`, PH[i < 8 ? 1 : 2], DUR);
    const [x0, y0] = tops[0];
    const arr = arrow(x0, y0 - 46, x0, y0 - 12, "#059669", 'class="jump"') + text(x0, y0 - 52, "a[0]", { size: 13, weight: 800, fill: "#059669", attrs: 'class="jump"' });
    css += `.jump{animation:jump ${DUR / 3}s ease-in-out infinite}@keyframes jump{0%,20%{transform:translateY(-14px);opacity:0}40%,85%{transform:translateY(0);opacity:1}100%{opacity:0}}`;
    const wins = PH.map((a, k) => [a, k < 2 ? PH[k + 1] : 94]);
    const cnt = stackedText((BB.x0 + BB.x1) / 2 + 60, BB.y0 + 4, NS.map((n) => `n = ${n} → 1 step`), wins, DUR, { size: 14, weight: 800, fill: "#2563EB" }, "c");
    css += cnt.css;
    const lab = text((BB.x0 + BB.x1) / 2, BB.y1 + 22, "Reading a[0] takes one step, however long the list is", { size: 13, weight: 700, fill: "#334155" });
    const stat = text((BB.x0 + BB.x1) / 2 + 60, BB.y0 + 4, "n = 16 → 1 step", { size: 14, weight: 800, fill: "#2563EB" });
    files["no-loop"] = svg("No loop: the list grows from 4 to 8 to 16 items, but reading a[0] is always one step", row + arr + (STATIC ? stat : cnt.s) + lab, css);
  }
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, s] of Object.entries(files)) fs.writeFileSync(path.join(OUT, name + ".svg"), s);
console.log(Object.keys(files).join(", "));
