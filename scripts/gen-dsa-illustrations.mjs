// Animated isometric SVG illustrations for the "What is DSA?" lesson.
//   node scripts/gen-dsa-illustrations.mjs public/dsa/what-is-dsa   (add --static for the Penpot copy)
// Each picture is centred: the viewBox is fitted to the drawing's bounds (360:220, padded).
// Animations are CSS inside the SVG (they run in <img>), and stop for prefers-reduced-motion.
// --static writes the resting frame without animation (used for the Penpot design).
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] || ".";
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(x0)} ${f(y0)} ${f(w)} ${f(h)}" width="360" height="220" role="img" aria-label="${title}"><title>${title}</title>${style}${body}</svg>\n`;
}

const files = {};

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

fs.mkdirSync(OUT, { recursive: true });
for (const [name, s] of Object.entries(files)) fs.writeFileSync(path.join(OUT, name + ".svg"), s);
console.log(Object.keys(files).join(", "));
