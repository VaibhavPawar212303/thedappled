// Animated isometric SVG illustrations for the DSA Foundations lessons.
//   node scripts/gen-dsa-illustrations.mjs what-is-dsa public/dsa/what-is-dsa
//   node scripts/gen-dsa-illustrations.mjs algorithms public/dsa/algorithms
// (add --static for the Penpot copy)
// Each picture is centred: the viewBox is fitted to the drawing's bounds (360:220, padded).
// Animations are CSS inside the SVG (they run in <img>), and stop for prefers-reduced-motion.
// --static writes the resting frame without animation (used for the Penpot design).
import fs from "node:fs";
import path from "node:path";

const [LESSON, OUT = "."] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!["what-is-dsa", "algorithms"].includes(LESSON)) throw new Error("usage: gen-dsa-illustrations.mjs <what-is-dsa|algorithms> <outDir> [--static]");
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

const iso = (ox, oy, s) => (x, y, z) => [ox + (x - y) * C * s, oy + (x + y) * S * s - z * s];
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
if (LESSON === "algorithms") {
  const pct = (v) => `${(+v).toFixed(1)}%`;
  // CSS for a label shown only between a% and z% of the loop. `first` labels also show from 96% (after the reset).
  const shown = (cls, dur, a, z, first = false) =>
    `.${cls}{animation:${cls} ${dur}s linear infinite;opacity:${first ? 1 : 0}}@keyframes ${cls}{` +
    (first ? `0%,${pct(z)}{opacity:1}${pct(z + 0.2)},${pct(95.8)}{opacity:0}96%,100%{opacity:1}}` : `0%,${pct(a - 0.2)}{opacity:0}${pct(a)},${pct(z)}{opacity:1}${pct(z + 0.2)},100%{opacity:0}}`);

  // 1. Recipe: a staircase of steps that light up in order while a token hops along
  {
    resetBB();
    const p = iso(0, 0, 26);
    const names = ["Boil water", "Add tea", "Wait 3 min", "Pour"];
    let b = ground(p, -0.4, -0.4, 4 * 1.7 + 0.2, 1.9);
    let lit = "", labels = "", css = "";
    const tops = [];
    names.forEach((nm, i) => {
      const x = i * 1.7, h = 0.5 + i * 0.55;
      b += box(p, x, 0, 0, 1.4, 1.4, h, BLUE);
      const on = 8 + i * 18; // % of the cycle when this step lights
      lit += `<g class="lit${i}">${box(p, x, 0, 0, 1.4, 1.4, h, GREEN)}</g>`;
      css += `.lit${i}{animation:lit${i} 5s ease-in-out infinite;opacity:0}@keyframes lit${i}{0%,${pct(on - 1)}{opacity:0}${pct(on + 3)},90%{opacity:1}97%,100%{opacity:0}}`;
      const [tx, ty] = topC(p, x, 0, 0, 1.4, 1.4, h);
      tops.push([tx, ty]);
      labels += text(tx, ty + 5, String(i + 1), { size: 14, weight: 800, fill: "#1E3A8A" });
      const [nx, ny] = p(x + 0.7, 2.1, 0);
      labels += text(nx, ny + 14, nm, { size: 12, weight: 700, fill: "#334155", anchor: "end" });
    });
    // token: a small cube hopping from step to step
    const [x0, y0] = tops[0];
    const tok = `<g class="tok"><circle cx="${f(x0)}" cy="${f(y0 - 26)}" r="6" fill="#059669" stroke="#047857"/></g>`;
    track(x0 - 6, y0 - 32);
    let kf = `0%{opacity:0;transform:translate(0,-10px)}6%{opacity:1;transform:translate(0,0)}`;
    tops.forEach(([x, y], i) => {
      const on = 8 + i * 18;
      kf += `${pct(on - 6)}{transform:translate(${f(tops[Math.max(0, i - 1)][0] - x0)}px,${f(tops[Math.max(0, i - 1)][1] - y0 - (i ? 14 : 0))}px)}`;
      kf += `${pct(on)}{transform:translate(${f(x - x0)}px,${f(y - y0)}px)}`;
    });
    kf += `90%{opacity:1;transform:translate(${f(tops[3][0] - x0)}px,${f(tops[3][1] - y0)}px)}97%,100%{opacity:0;transform:translate(${f(tops[3][0] - x0)}px,${f(tops[3][1] - y0)}px)}`;
    css += `.tok{animation:tok 5s ease-in-out infinite}@keyframes tok{${kf}}`;
    labels += caption("The same steps, in the same order, every time");
    files["recipe"] = svg("An algorithm is a recipe: numbered steps followed in order", b + (STATIC ? "" : lit) + labels + (STATIC ? "" : tok), css);
  }

  // A row of standing pages (a phone book seen from the side). Returns tops for pointers.
  const pages = (p, n, gap, colOf) => {
    let s = "";
    const tops = [];
    for (let i = 0; i < n; i++) {
      const x = i * gap;
      s += `<g class="pg${i}">${box(p, x, 0, 0, gap * 0.62, 1.3, 1.7, colOf(i))}</g>`;
      tops.push(topC(p, x, 0, 0, gap * 0.62, 1.3, 1.7));
    }
    return { s, tops };
  };
  const pointer = (x, y, cls) => {
    track(x - 7, y - 30);
    return `<polygon class="${cls}" points="${f(x - 7)},${f(y - 30)} ${f(x + 7)},${f(y - 30)} ${f(x)},${f(y - 18)}" fill="#2563EB"/>`;
  };
  // "N looks" counter: stacked texts, each visible in its window
  const counter = (x, y, windows, word = "look") =>
    windows
      .map((_, i) => text(x, y, `${i + 1} ${word}${i ? "s" : ""}`, { size: 13, weight: 800, fill: "#2563EB", attrs: `class="c${i}"` }))
      .join("");
  const counterCss = (windows) =>
    windows.map(([a, z], i) => shown(`c${i}`, 7, a, i < windows.length - 1 ? z - 0.3 : z)).join("");

  // 2. Phone book, way 1: check every page in turn
  {
    resetBB();
    const p = iso(0, 0, 22);
    const N = 10, T = 7; // "Meera" is on page 7
    let b = ground(p, -0.4, -0.4, N * 0.9 + 0.2, 2);
    const { s, tops } = pages(p, N, 0.9, (i) => (i === T ? GREEN : GREY));
    b += s;
    const [x0, y0] = tops[0];
    let kf = "", css = "";
    const win = [];
    for (let i = 0; i <= T; i++) {
      const t = 6 + i * 10;
      kf += `${pct(t)}{opacity:1;transform:translate(${f(tops[i][0] - x0)}px,${f(tops[i][1] - y0)}px)}`;
      win.push([t, i === T ? 92 : t + 10]);
    }
    css += `.p1{animation:p1 7s steps(1,end) infinite}@keyframes p1{0%{opacity:0}${pct(5.9)}{opacity:0}${kf}92%{opacity:1;transform:translate(${f(tops[T][0] - x0)}px,${f(tops[T][1] - y0)}px)}93%,100%{opacity:0}}`;
    css += `.pg${T}{animation:hit 7s ease-in-out infinite}@keyframes hit{0%,${pct(76)}{transform:translateY(0)}${pct(80)},90%{transform:translateY(-8px)}96%,100%{transform:translateY(0)}}`;
    const cy = Math.min(...tops.map((t) => t[1])) - 44;
    const cnt = counter((BB.x0 + BB.x1) / 2, cy, win);
    css += counterCss(win);
    const cap = caption("Check every name: one look per page");
    files["phone-book-scan"] = svg("Way 1: check every page, one look at a time, until the name is found", b + (STATIC ? "" : pointer(x0, y0, "p1") + cnt) + cap, css);
  }

  // 3. Phone book, way 2: open the middle and throw half away each time
  {
    resetBB();
    const p = iso(0, 0, 22);
    const N = 16, T = 11;
    // looks at the middle of the current range; after each look the other half goes
    const ranges = [[0, 16], [8, 16], [8, 12], [10, 12]];
    const mids = [8, 12, 10, 11];
    const lookAt = (k) => 8 + k * 20; // % when look k happens
    const goneAfter = (i) => { for (let k = 0; k < ranges.length; k++) { const [a, z] = ranges[k + 1] ?? [T, T + 1]; if (i < a || i >= z) return k; } return -1; };
    let b = ground(p, -0.4, -0.4, N * 0.62 + 0.2, 2);
    const { s, tops } = pages(p, N, 0.62, (i) => (i === T ? GREEN : GREY));
    b += s;
    let css = "";
    for (let i = 0; i < N; i++) {
      if (i === T) continue;
      const k = goneAfter(i);
      const t = lookAt(k) + 8;
      css += `.pg${i}{animation:g${i} 7s ease-in-out infinite}@keyframes g${i}{0%,${pct(t)}{opacity:1;transform:translateY(0)}${pct(t + 6)},92%{opacity:.18;transform:translateY(6px)}98%,100%{opacity:1;transform:translateY(0)}}`;
    }
    css += `.pg${T}{animation:hit2 7s ease-in-out infinite}@keyframes hit2{0%,${pct(lookAt(3))}{transform:translateY(0)}${pct(lookAt(3) + 5)},90%{transform:translateY(-8px)}96%,100%{transform:translateY(0)}}`;
    const [x0, y0] = tops[mids[0]];
    let kf = `0%{opacity:0}${pct(lookAt(0) - 0.1)}{opacity:0}`;
    mids.forEach((m, k) => (kf += `${pct(lookAt(k))}{opacity:1;transform:translate(${f(tops[m][0] - x0)}px,${f(tops[m][1] - y0)}px)}`));
    kf += `92%{opacity:1;transform:translate(${f(tops[T][0] - x0)}px,${f(tops[T][1] - y0)}px)}93%,100%{opacity:0}`;
    css += `.p2{animation:p2 7s steps(1,end) infinite}@keyframes p2{${kf}}`;
    const win = mids.map((_, k) => [lookAt(k), k === 3 ? 92 : lookAt(k + 1) - 0.2]);
    const cy = Math.min(...tops.map((t) => t[1])) - 44;
    const cnt = counter((BB.x0 + BB.x1) / 2, cy, win);
    css += counterCss(win);
    const cap = caption("Open the middle: each look throws half away");
    files["phone-book-halve"] = svg("Way 2: open the middle and keep the half with the name; four looks for sixteen pages", b + (STATIC ? "" : pointer(x0, y0, "p2") + cnt) + cap, css);
  }

  // 4. Add up a list: each number hops into the total, which counts up
  {
    resetBB();
    const p = iso(0, 0, 24);
    const vals = [3, 1, 4, 1, 5];
    let b = ground(p, -0.4, -0.4, 5 * 1.3 + 2.6, 1.9);
    const TX = 5 * 1.3 + 0.4;
    b += box(p, TX, -0.2, 0, 1.5, 1.5, 1.3, GREEN);
    const [tx, ty] = topC(p, TX, -0.2, 0, 1.5, 1.5, 1.3);
    let css = "", blocks = "";
    const hopAt = (i) => 10 + i * 15;
    vals.forEach((v, i) => {
      const x = i * 1.3;
      const [bx, by] = topC(p, x, 0, 0, 1, 1, 0.8);
      blocks += `<g class="n${i}">${box(p, x, 0, 0, 1, 1, 0.8, BLUE)}${text(bx, by + 5, v, { size: 14, weight: 800, fill: "#1E3A8A" })}</g>`;
      const dx = tx - bx, dy = ty - by, t = hopAt(i);
      // straight up, across above the row, then down into the total
      const up = -64 - Math.max(0, -dy);
      css += `.n${i}{animation:n${i} 6s ease-in-out infinite}@keyframes n${i}{0%,${pct(t)}{transform:translate(0,0);opacity:1}${pct(t + 3)}{transform:translate(0,${f(up)}px);opacity:1}${pct(t + 7)}{transform:translate(${f(dx)}px,${f(up)}px);opacity:1}${pct(t + 9)}{transform:translate(${f(dx)}px,${f(dy - 26)}px);opacity:0}93%{transform:translate(${f(dx)}px,${f(dy - 26)}px);opacity:0}96%{transform:translate(0,0);opacity:0}100%{transform:translate(0,0);opacity:1}}`;
    });
    // running total, shown on the total box
    const totals = [0, 3, 4, 8, 9, 14];
    let tot = "";
    totals.forEach((v, k) => {
      const a = k === 0 ? 0 : hopAt(k - 1) + 10, z = k === totals.length - 1 ? 94 : hopAt(k) + 10;
      tot += text(tx, ty + 6, v, { size: 16, weight: 800, fill: "#065F46", attrs: `class="t${k}"` });
      css += shown(`t${k}`, 6, a, k === totals.length - 1 ? z : z - 0.4, k === 0);
    });
    const [rx, ry] = p(TX + 1.5, -0.2, 1.3);
    const label = text(rx + 10, ry + 4, "total", { size: 12, weight: 800, fill: "#059669", anchor: "start" });
    track(tx, ty - 84); // room for the hop
    const cap = caption("5 numbers → 5 additions, on any computer");
    const staticTot = text(tx, ty + 6, 14, { size: 16, weight: 800, fill: "#065F46" });
    files["sum"] = svg("Adding up a list: each number is added to the total once", b + blocks + (STATIC ? staticTot : tot) + label + cap, css);
  }

  // 5. What n means: n doubles; the n-step row doubles, the log n tower adds one block
  {
    resetBB();
    const p = iso(0, 0, 15);
    const q = iso(205, 6, 15);
    let b = ground(p, -0.4, -0.4, 16 * 0.8 + 0.2, 1.6);
    let css = "", row = "", tower = "";
    const phase = [0, 33, 66]; // n = 4, 8, 16
    const showAt = (ph) => phase[ph];
    const fade = (cls, ph) =>
      ph === 0 ? "" : `.${cls}{animation:${cls} 7.5s ease-out infinite;opacity:0}@keyframes ${cls}{0%,${pct(showAt(ph) + 1)}{opacity:0;transform:translateY(-10px)}${pct(showAt(ph) + 6)},94%{opacity:1;transform:translateY(0)}98%,100%{opacity:0}}`;
    for (let i = 0; i < 16; i++) {
      const ph = i < 4 ? 0 : i < 8 ? 1 : 2;
      row += `<g class="r${i}">${box(p, i * 0.8, 0, 0, 0.6, 0.6, 0.6, BLUE)}</g>`;
      css += fade(`r${i}`, ph).replaceAll(`@keyframes r${i}`, `@keyframes r${i}`);
    }
    b += `${ground(q, -0.6, -0.6, 1.8, 1.8)}`;
    for (let j = 0; j < 4; j++) {
      const ph = j < 2 ? 0 : j === 2 ? 1 : 2;
      tower += `<g class="w${j}">${box(q, 0, 0, j * 0.7, 0.6, 0.6, 0.6, GREEN)}</g>`;
      css += fade(`w${j}`, ph);
    }
    // labels: n = 4 / 8 / 16 with step counts
    const [lx, ly] = p(6, 2.2, 0);
    const [wx, wy] = q(0.3, 1.6, 0);
    const lab = (k, n, lg) => {
      const a = showAt(k), z = k === 2 ? 94 : showAt(k + 1) - 0.2;
      css += shown(`l${k}`, 7.5, a, k === 2 ? z : z - 0.4, k === 0);
      return `<g class="l${k}">${text(lx, ly + 22, `n = ${n} → ${n} steps`, { size: 13, weight: 800, fill: "#1D4ED8" })}${text(wx, wy + 22, `log n → ${lg} steps`, { size: 13, weight: 800, fill: "#047857" })}</g>`;
    };
    const labels = STATIC
      ? text(lx, ly + 22, "n = 16 → 16 steps", { size: 13, weight: 800, fill: "#1D4ED8" }) + text(wx, wy + 22, "log n → 4 steps", { size: 13, weight: 800, fill: "#047857" })
      : lab(0, 4, 2) + lab(1, 8, 3) + lab(2, 16, 4);
    const cap = caption("Double n: the row doubles, the tower grows by one");
    files["n-grows"] = svg("As n doubles, n steps doubles but log n steps grows by only one", b + row + tower + labels + cap, css);
  }
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, s] of Object.entries(files)) fs.writeFileSync(path.join(OUT, name + ".svg"), s);
console.log(Object.keys(files).join(", "));
