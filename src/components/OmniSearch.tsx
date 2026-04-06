"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDeptColor } from "@/lib/constants";

interface SearchEntry {
  type: "topic" | "note" | "question";
  title: string;
  snippet?: string;
  href: string;
  department?: string;
  meta?: string;
  keywords?: string;
}

const TYPE_LABELS: Record<string, string> = {
  note: "Ders Notları",
};

const TYPE_ORDER: string[] = ["note"];

function turkishNormalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/İ/g, "i")
    .replace(/Ç/g, "c")
    .replace(/Ğ/g, "g")
    .replace(/Ö/g, "o")
    .replace(/Ş/g, "s")
    .replace(/Ü/g, "u");
}

function search(entries: SearchEntry[], query: string): SearchEntry[] {
  const normalized = turkishNormalize(query);
  const tokens = normalized.split(/\s+/).filter((t) => t.length > 0);
  if (tokens.length === 0) return [];

  const scored = entries
    .map((entry) => {
      const haystack = turkishNormalize(
        `${entry.title} ${entry.department || ""} ${entry.meta || ""} ${entry.keywords || ""}`
      );
      const allMatch = tokens.every((token) => haystack.includes(token));
      if (!allMatch) return null;

      let score = 0;
      const titleNorm = turkishNormalize(entry.title);
      for (const token of tokens) {
        if (titleNorm.includes(token)) score += 10;
        if (titleNorm.startsWith(token)) score += 5;
      }
      if (entry.type === "topic") score += 3;
      if (entry.type === "note") score += 1;
      return { entry, score };
    })
    .filter(Boolean) as { entry: SearchEntry; score: number }[];

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.entry);
}

const MAX_PER_GROUP = 5;

export function OmniSearch({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => search(entries, query), [entries, query]);

  const grouped = useMemo(() => {
    const groups: { type: string; label: string; items: SearchEntry[] }[] = [];
    for (const type of TYPE_ORDER) {
      const items = results.filter((r) => r.type === type).slice(0, MAX_PER_GROUP);
      if (items.length > 0) {
        groups.push({ type, label: TYPE_LABELS[type], items });
      }
    }
    return groups;
  }, [results]);

  const flatResults = useMemo(
    () => grouped.flatMap((g) => g.items),
    [grouped]
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (
        e.key === "/" &&
        !open &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flatResults[activeIndex]) {
      const href = flatResults[activeIndex].href;
      close();
      router.push(href);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all min-h-[36px]"
        style={{ color: "var(--text-tertiary)", borderWidth: 1, borderStyle: "solid", borderColor: "var(--border-color)" }}
        aria-label="Ara (Cmd+K)"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className="hidden sm:inline">Ara</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: "var(--hover-bg)", color: "var(--text-tertiary)" }}>
          <span>⌘</span>K
        </kbd>
      </button>
    );
  }

  let itemIndex = 0;

  return (
    <div
      className="omnisearch-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Arama"
    >
      <div className="omnisearch-modal" onKeyDown={handleKeyDown} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Konu, ders notu veya soru ara..."
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: "var(--text-primary)" }}
            aria-label="Arama"
            autoComplete="off"
          />
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer"
            style={{ background: "var(--hover-bg)", color: "var(--text-tertiary)" }}
            onClick={close}
          >
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
          {query.length > 0 && flatResults.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">
              Sonuç bulunamadı
            </p>
          )}

          {query.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">
              Yazmaya başlayın...
            </p>
          )}

          {grouped.map((group) => (
            <div key={group.type} className="mb-2">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                {group.label}
              </div>
              {group.items.map((item) => {
                const idx = itemIndex++;
                const isActive = idx === activeIndex;
                const deptColor = item.department
                  ? getDeptColor(item.department)
                  : undefined;
                return (
                  <div
                    key={`${item.type}-${item.href}-${idx}`}
                    role="option"
                    aria-selected={isActive}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                      isActive
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      const href = item.href;
                      close();
                      router.push(href);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-800 truncate">{item.title}</div>
                      {(item.snippet || item.meta) && (
                        <div className="text-xs text-gray-400 truncate mt-0.5">
                          {item.snippet || item.meta}
                        </div>
                      )}
                    </div>
                    {deptColor && (
                      <span
                        className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-700"
                        style={{ background: deptColor }}
                      >
                        {item.department}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
