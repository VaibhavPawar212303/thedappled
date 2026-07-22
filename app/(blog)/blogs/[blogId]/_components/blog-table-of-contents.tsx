"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
}

function slugify(text: string, taken: Map<string, number>) {
  let slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "section";
  const count = taken.get(slug) ?? 0;
  taken.set(slug, count + 1);
  return count > 0 ? `${slug}-${count}` : slug;
}

export const BlogTableOfContents = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // The sidebar (in the layout) can mount and run this effect before the
    // article content (in the page, behind its own loading.tsx boundary)
    // has streamed in and attached to the DOM. Watch for it to appear
    // instead of assuming it's already there.
    let intersectionObserver: IntersectionObserver | undefined;

    const extractHeadings = (container: HTMLElement) => {
      const elements = Array.from(container.querySelectorAll<HTMLHeadingElement>("h2"));
      if (elements.length === 0) return false;

      const taken = new Map<string, number>();
      const list = elements.map((el) => {
        const id = el.id || slugify(el.textContent ?? "", taken);
        el.id = id;
        return { id, text: el.textContent ?? "" };
      });
      setHeadings(list);
      setActiveId(list[0]?.id ?? null);

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting);
          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
          }
        },
        { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
      );
      elements.forEach((el) => intersectionObserver!.observe(el));
      return true;
    };

    const existing = document.getElementById("article-content");
    if (existing && extractHeadings(existing)) {
      return () => intersectionObserver?.disconnect();
    }

    const mutationObserver = new MutationObserver(() => {
      const container = document.getElementById("article-content");
      if (container && extractHeadings(container)) {
        mutationObserver.disconnect();
      }
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      intersectionObserver?.disconnect();
    };
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className="flex flex-col w-full">
      <div className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        On this page
      </div>
      {headings.map((heading) => {
        const isActive = heading.id === activeId;
        return (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              "flex items-center gap-x-2 text-slate-500 dark:text-slate-400 text-sm font-medium pl-6 py-3 transition-all hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-300/20 dark:hover:bg-slate-800",
              isActive && "text-slate-900 dark:text-slate-50 bg-slate-200/20 dark:bg-slate-800"
            )}
          >
            <span className="line-clamp-2">{heading.text}</span>
            <span
              className={cn(
                "ml-auto w-1 self-stretch opacity-0 bg-blue-600 dark:bg-blue-400 transition-all",
                isActive && "opacity-100"
              )}
            />
          </a>
        );
      })}
    </div>
  );
};
