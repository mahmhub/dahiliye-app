"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface NoteItem {
  slug: string;
  title: string;
  lineCount: number;
}

interface NoteGroup {
  slug: string;
  dir: string;
  label: string;
  color: string;
  notes: NoteItem[];
}

export function NotlarFilter({ groups }: { groups: NoteGroup[] }) {
  const searchParams = useSearchParams();
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const dept = searchParams.get("dept");
    if (dept) setDeptFilter(dept);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = groups;

    if (deptFilter) {
      result = result.filter((g) => g.label === deptFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result
        .map((g) => ({
          ...g,
          notes: g.notes.filter((n) => n.title.toLowerCase().includes(q)),
        }))
        .filter((g) => g.notes.length > 0);
    }

    return result;
  }, [groups, deptFilter, search]);

  const totalNotes = filtered.reduce((s, g) => s + g.notes.length, 0);
  const allNotes = groups.reduce((s, g) => s + g.notes.length, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <label className="sr-only" htmlFor="note-search">Not ara</label>
        <input
          id="note-search"
          type="search"
          placeholder="Not ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-h-[44px]"
          aria-label="Not adına göre filtrele"
        />
        <label className="sr-only" htmlFor="dept-select-notlar">Anabilim dalı filtrele</label>
        <select
          id="dept-select-notlar"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
          aria-label="Anabilim dalına göre filtrele"
        >
          <option value="">Tüm Anabilim Dalları</option>
          {groups.map((g) => (
            <option key={g.dir} value={g.label}>
              {g.label}
            </option>
          ))}
        </select>
        {(deptFilter || search) && (
          <button
            onClick={() => { setDeptFilter(""); setSearch(""); }}
            className="px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:bg-gray-50 transition-colors min-h-[44px] whitespace-nowrap"
            aria-label="Filtreleri temizle"
          >
            × Temizle
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-8">
          Arama kriterlerine uygun ders notu bulunamadı.
        </p>
      ) : (
        filtered.map((group) => (
          <section key={group.dir} className="mb-8" aria-labelledby={`section-${group.dir}`}>
            <h2
              id={`section-${group.dir}`}
              className="text-lg font-semibold text-gray-800 mb-3 px-3 py-1.5 rounded-lg inline-block"
              style={{ background: group.color }}
            >
              {group.label}
            </h2>
            <div className="flex flex-col gap-2 mt-2" role="list">
              {group.notes.map((note) => (
                <Link
                  key={note.slug}
                  href={`/not/${group.slug}/${note.slug}/`}
                  className="flex items-center justify-between rounded-xl px-4 py-3 transition-all hover:shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[52px]"
                  style={{ background: group.color }}
                  role="listitem"
                  aria-label={`${note.title} — ${note.lineCount} satır`}
                >
                  <h3 className="font-medium text-gray-900 text-sm">{note.title}</h3>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{note.lineCount} satır</span>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      <p className="text-xs text-gray-400 mt-4" role="status" aria-live="polite">
        {totalNotes} / {allNotes} ders notu gösteriliyor
        {deptFilter ? ` · ${deptFilter}` : ""}
      </p>
    </div>
  );
}
