"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface TocItem { id: string; text: string; level: number; color: string; }
interface SidebarItem { dir: string; dirLabel: string; files: { slug: string; title: string }[]; }

export function NotePage({
  html, toc, sidebar, fileName, totalLines, currentDir, currentSlug,
}: {
  html: string;
  toc: TocItem[];
  sidebar: SidebarItem[];
  fileName: string;
  totalLines: number;
  currentDir: string;
  currentSlug: string;
}) {
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [openDirs, setOpenDirs] = useState<Record<string, boolean>>({ [currentDir]: true });
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  // Read "from" param so we can show a "back to question" button
  const rawFrom = searchParams.get("from");
  const fromPath = rawFrom ? decodeURIComponent(rawFrom) : null;

  // Back-to-top visibility
  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 400);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHash = useCallback(() => {
    const hash = decodeURIComponent(window.location.hash);
    if (!hash || !hash.startsWith("#L")) return;

    setShowLineNumbers(true);

    const rangeStr = hash.slice(2);
    const ranges = rangeStr.split(",").map((r) => r.trim());
    const firstParts = ranges[0].split("-");
    const scrollTarget = parseInt(firstParts[0], 10);

    setTimeout(() => {
      if (!isNaN(scrollTarget)) {
        const targetEl = document.getElementById(`L${scrollTarget}`);
        if (targetEl) {
          const y = targetEl.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }

      for (const range of ranges) {
        const parts = range.split("-");
        const start = parseInt(parts[0], 10);
        const end = parts.length > 1 ? parseInt(parts[1], 10) : start + 3;
        if (isNaN(start)) continue;
        for (let ln = start; ln <= end; ln++) {
          const el = document.getElementById(`L${ln}`);
          if (el) {
            el.classList.add("line-highlight");
            setTimeout(() => el.classList.remove("line-highlight"), 4000);
          }
        }
      }
    }, 500);
  }, []);

  useEffect(() => {
    handleHash();
    const t1 = setTimeout(handleHash, 500);
    const t2 = setTimeout(handleHash, 1500);
    const t3 = setTimeout(handleHash, 3000);

    window.addEventListener("hashchange", handleHash);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("hashchange", handleHash);
    };
  }, [handleHash]);

  function toggleDir(dir: string) {
    setOpenDirs((prev) => ({ ...prev, [dir]: !prev[dir] }));
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Close sidebar when clicking a link on mobile
  function handleSidebarLinkClick() {
    setSidebarOpen(false);
  }

  // Toggle TOC — use a stable handler
  function handleTocToggle() {
    setTocOpen((prev) => !prev);
  }

  function handleTocLinkClick() {
    setTocOpen(false);
  }

  return (
    <div className="flex min-h-screen -mx-4 -my-6">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="note-sidebar"
        className={`fixed lg:sticky top-[49px] left-0 z-50 lg:z-auto h-[calc(100vh-49px)] w-72 border-r border-gray-200 overflow-y-auto transition-transform lg:translate-x-0 flex-shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--porcelain)" }}
        aria-label="Ders notları listesi"
        role="navigation"
      >
        <div className="p-4">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 mb-4 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            ← Ana Sayfa
          </Link>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Ders Notları
          </h3>
          <nav className="space-y-1" aria-label="Not kategorileri">
            {sidebar.map((group) => (
              <div key={group.dir}>
                <button
                  onClick={() => toggleDir(group.dir)}
                  className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-expanded={!!openDirs[group.dir]}
                  aria-controls={`sidebar-dir-${group.dir}`}
                >
                  <span>{group.dirLabel}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${
                      openDirs[group.dir] ? "rotate-90" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {openDirs[group.dir] && (
                  <div
                    id={`sidebar-dir-${group.dir}`}
                    className="ml-2 mt-1 space-y-0.5"
                  >
                    {group.files.map((file) => {
                      const isActive =
                        group.dir === currentDir && file.slug === currentSlug;
                      return (
                        <a
                          key={file.slug}
                          href={`/not/${group.dir}/${file.slug}/`}
                          onClick={handleSidebarLinkClick}
                          className={`block px-3 py-2 text-xs rounded-lg transition-colors truncate min-h-[36px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                            isActive
                              ? "font-semibold text-gray-900"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                          style={isActive ? { background: "var(--turquoise)" } : undefined}
                          aria-current={isActive ? "page" : undefined}
                          title={file.title}
                        >
                          {file.title}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div
          className="sticky top-[49px] z-30 border-b border-gray-200 px-3 md:px-4 py-2 flex items-center justify-between gap-2 no-print"
          style={{ background: "var(--surface-secondary)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label={sidebarOpen ? "Kenar çubuğunu kapat" : "Kenar çubuğunu aç"}
              aria-controls="note-sidebar"
              aria-expanded={sidebarOpen}
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            {/* Back to question button — shown when navigated from a question */}
            {fromPath && (
              <a
                href={fromPath}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 min-h-[36px]"
                aria-label="Soruya geri dön"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Soruya Dön
              </a>
            )}

            <span className="text-xs text-gray-500 truncate" title={fileName}>
              {fileName}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Back to question — mobile */}
            {fromPath && (
              <a
                href={fromPath}
                className="sm:hidden p-2 rounded-lg hover:bg-violet-100 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Soruya geri dön"
              >
                <svg
                  className="w-4 h-4 text-violet-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </a>
            )}

            {/* Mobile TOC toggle */}
            {toc.length > 0 && (
              <button
                type="button"
                onClick={handleTocToggle}
                className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label={tocOpen ? "İçindekileri kapat" : "İçindekileri aç"}
                aria-expanded={tocOpen}
                aria-controls="mobile-toc"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </button>
            )}
            <span className="text-xs text-gray-400 hidden sm:inline">{totalLines} satır</span>

            {/* Print button */}
            <button
              onClick={() => window.print()}
              className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-w-[36px] min-h-[36px] items-center justify-center no-print"
              aria-label="Notu yazdır"
              title="Yazdır"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile TOC dropdown */}
        {tocOpen && toc.length > 0 && (
          <div
            id="mobile-toc"
            className="xl:hidden border-b border-gray-200 px-4 py-3 max-h-60 overflow-y-auto no-print"
            style={{ background: "var(--porcelain)" }}
            role="navigation"
            aria-label="İçindekiler (mobil)"
          >
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              İçindekiler
            </h4>
            <ul className="space-y-1">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={handleTocLinkClick}
                    className="block text-sm leading-snug hover:opacity-70 transition-opacity py-1 min-h-[32px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                    style={{
                      color: item.color,
                      paddingLeft: item.level === 2 ? "16px" : "0",
                      fontWeight: item.level === 1 ? 600 : 400,
                    }}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mobile back-to-question banner (below top bar, above content) */}
        {fromPath && (
          <div className="sm:hidden border-b border-violet-200 px-4 py-2 no-print" style={{ background: "var(--mauve-magic)" }}>
            <a
              href={fromPath}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-800 hover:text-violet-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Soruya Geri Dön
            </a>
          </div>
        )}

        <div className="flex">
          {/* Article */}
          <article
            ref={articleRef}
            className={`flex-1 min-w-0 px-3 md:px-8 py-4 md:py-6 max-w-4xl ${
              showLineNumbers ? "show-line-numbers" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: html }}
            aria-label={`${fileName} içeriği`}
          />

          {/* Right TOC (desktop) */}
          {toc.length > 0 && (
            <nav
              className="hidden xl:block w-56 flex-shrink-0 sticky top-[97px] h-[calc(100vh-97px)] overflow-y-auto py-6 pr-4 no-print"
              aria-label="İçindekiler"
            >
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                İçindekiler
              </h4>
              <ul className="space-y-1.5">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block text-xs leading-snug hover:opacity-70 transition-opacity truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded py-0.5"
                      style={{
                        color: item.color,
                        paddingLeft: item.level === 2 ? "12px" : "0",
                        fontWeight: item.level === 1 ? 600 : 400,
                      }}
                      title={item.text}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Back to question — desktop TOC */}
              {fromPath && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <a
                    href={fromPath}
                    className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                  >
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Soruya Geri Dön
                  </a>
                </div>
              )}
            </nav>
          )}
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className={`back-to-top no-print ${showBackToTop ? "visible" : ""}`}
        aria-label="Sayfanın başına dön"
        title="Başa dön"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
