"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { inputClass } from "../../ui-automation/_components/practice-layout";
import { useAssignmentReporter } from "../../ui-automation/_components/assignment-reporter";
import { AssignmentNote } from "../../ui-automation/_components/assignment-banner";
import { engineStep, type Engine } from "@/lib/browser-engine";

type Product = { id: string; name: string; price: number; tint: string };

const PRODUCTS: Product[] = [
  { id: "notebook", name: "Testing Notebook", price: 299, tint: "bg-blue-100 dark:bg-blue-950" },
  { id: "mug", name: "Bug Hunter Mug", price: 449, tint: "bg-purple-100 dark:bg-purple-950" },
  { id: "stickers", name: "Green Build Sticker Pack", price: 99, tint: "bg-emerald-100 dark:bg-emerald-950" },
  { id: "ball", name: "Flaky Test Stress Ball", price: 199, tint: "bg-amber-100 dark:bg-amber-950" },
];

type Screen = "signin" | "products" | "cart" | "done";
type Order = { id: string; items: number; total: number };

const shuffle = <T,>(xs: T[]) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const rupees = (n: number) => `₹${n}`;
const newOrderId = () => `DP-${1000 + Math.floor(Math.random() * 9000)}`;

const primaryBtn = "h-12 w-full rounded-[10px] bg-emerald-600 text-[15px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60";

// The engine this page is running in, from browser features (not the user agent, which the server
// checks separately): Gecko exposes mozInnerScreenX, Chromium exposes navigator.userAgentData.
export function detectEngine(): Engine {
  const w = window as unknown as { mozInnerScreenX?: unknown };
  if (typeof w.mozInnerScreenX === "number" || CSS.supports("-moz-appearance", "none")) return "firefox";
  if ("userAgentData" in navigator) return "chromium";
  return "webkit";
}

export type ShopStage = "page-objects" | "cross-browser";

// The stage 3 practice shop: sign in → products → cart → confirmation, all on one URL, so tests
// must model page state rather than navigate between URLs. Product order changes on every sign-in,
// which rewards stable test-id locators kept in one place (a page class).
// Stage 4 reuses it: there only the confirmation is reported, once per browser engine.
export function DemoShop({ stage = "page-objects" }: { stage?: ShopStage }) {
  const xb = stage === "cross-browser";
  const { token, report } = useAssignmentReporter();
  const [screen, setScreen] = React.useState<Screen>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<"wrong" | "no-token" | null>(null);
  const [order, setOrder] = React.useState<Product[]>(PRODUCTS);
  const [cart, setCart] = React.useState<string[]>([]);
  const [placed, setPlaced] = React.useState<Order | null>(null);
  const cartReported = React.useRef(false);

  const items = PRODUCTS.filter((p) => cart.includes(p.id));
  const total = items.reduce((s, p) => s + p.price, 0);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("no-token");
      return;
    }
    setBusy(true);
    setError(null);
    let ok = false;
    try {
      const r = await fetch(`/api/assignments/${stage}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      ok = r.ok && Boolean((await r.json()).ok);
    } catch {}
    setBusy(false);
    if (!ok) {
      setError("wrong");
      return;
    }
    setOrder(shuffle(PRODUCTS));
    setScreen("products");
    if (!xb) report("pom-login");
  };

  const add = (id: string) => {
    if (cart.includes(id)) return;
    const next = [...cart, id];
    setCart(next);
    if (!xb && next.length >= 2 && !cartReported.current) {
      cartReported.current = true;
      report("pom-cart");
    }
  };

  const placeOrder = () => {
    if (!items.length) return;
    setPlaced({ id: newOrderId(), items: items.length, total });
    setCart([]);
    setScreen("done");
    if (xb) {
      const engine = detectEngine();
      report(engineStep(engine), { engine });
    } else {
      report("pom-checkout");
    }
  };

  if (screen === "signin") {
    return (
      <form onSubmit={signIn} noValidate data-testid="screen-signin">
        <h1 className="text-3xl font-extrabold tracking-tight">Dappled Shop</h1>
        <p className="mt-2 text-muted-foreground">Sign in with your shop credentials.</p>
        <div className="mt-6">
          <label htmlFor="shop-email" className="text-sm font-semibold">Email</label>
          <input id="shop-email" data-testid="shop-email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div className="mt-5">
          <label htmlFor="shop-password" className="text-sm font-semibold">Password</label>
          <input id="shop-password" data-testid="shop-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" data-testid="shop-signin" disabled={busy} className={`mt-6 ${primaryBtn}`}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {error === "wrong" && (
          <div data-testid="shop-error" role="alert" className="mt-5 rounded-[10px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
            Wrong email or password.
          </div>
        )}
        {error === "no-token" && (
          <div data-testid="shop-no-token" role="alert" className="mt-5 rounded-[10px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            This page needs your assignment link (it ends in <code>?a=…</code>). Open it from your assignment page.
          </div>
        )}
        <AssignmentNote />
      </form>
    );
  }

  if (screen === "products") {
    return (
      <div data-testid="screen-products">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Products</h1>
          <button type="button" data-testid="cart-link" onClick={() => setScreen("cart")} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">
            Cart · <span data-testid="cart-count">{cart.length}</span>
          </button>
        </div>
        <ul className="m-0 mt-6 list-none space-y-3 p-0">
          {order.map((p) => {
            const added = cart.includes(p.id);
            return (
              <li key={p.id} data-testid={`product-${p.id}`} className="flex items-center gap-4 rounded-xl border bg-slate-50 p-4 dark:bg-slate-900/40">
                <span className={`h-16 w-16 shrink-0 rounded-lg ${p.tint}`} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{p.name}</span>
                  <span className="mt-1 block text-muted-foreground">{rupees(p.price)}</span>
                </span>
                <button
                  type="button"
                  data-testid={`add-${p.id}`}
                  onClick={() => add(p.id)}
                  aria-pressed={added}
                  className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-lg px-4 text-sm font-bold ${added ? "border border-emerald-600 bg-white text-emerald-700 dark:bg-transparent dark:text-emerald-400" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                >
                  {added ? <>Added <Check className="h-3.5 w-3.5" /></> : "Add"}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[13px] text-muted-foreground">Demo items only — nothing is sold or charged.</p>
        <AssignmentNote />
      </div>
    );
  }

  if (screen === "cart") {
    return (
      <div data-testid="screen-cart">
        <h1 className="text-3xl font-extrabold tracking-tight">Your cart</h1>
        {items.length ? (
          <ul className="m-0 mt-6 list-none space-y-3 p-0">
            {items.map((p) => (
              <li key={p.id} data-testid="cart-item" data-product={p.id} className="flex items-center justify-between gap-4">
                <span className="min-w-0">
                  <span className="block">{p.name}</span>
                  <button type="button" data-testid="remove-item" onClick={() => setCart((c) => c.filter((x) => x !== p.id))} className="text-xs font-semibold text-red-600 hover:underline">
                    Remove
                  </button>
                </span>
                <span>{rupees(p.price)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p data-testid="cart-empty" className="mt-6 text-muted-foreground">Your cart is empty.</p>
        )}
        <div className="mt-5 flex items-center justify-between border-t pt-5 font-extrabold">
          <span>Total</span>
          <span data-testid="cart-total">{rupees(total)}</span>
        </div>
        <button type="button" data-testid="place-order" onClick={placeOrder} disabled={!items.length} className={`mt-6 ${primaryBtn}`}>
          Place order
        </button>
        <button type="button" data-testid="back-to-products" onClick={() => setScreen("products")} className="mt-4 text-sm font-semibold text-blue-600 hover:underline">
          ← Keep shopping
        </button>
        <AssignmentNote />
      </div>
    );
  }

  return (
    <div data-testid="order-confirmation" role="status" className="rounded-2xl border border-emerald-400 bg-emerald-50 p-6 dark:bg-emerald-950/40">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">Order placed</h1>
          <p className="mt-1 text-emerald-700 dark:text-emerald-400">
            Order <span data-testid="order-id">#{placed?.id}</span> · {placed?.items} item{placed?.items === 1 ? "" : "s"} · {rupees(placed?.total ?? 0)}
          </p>
        </div>
      </div>
      <button type="button" data-testid="back-to-products" onClick={() => setScreen("products")} className="mt-5 text-sm font-semibold text-blue-600 hover:underline">
        ← Keep shopping
      </button>
      <AssignmentNote />
    </div>
  );
}
