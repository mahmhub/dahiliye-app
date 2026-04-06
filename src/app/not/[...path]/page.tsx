import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NotePage as NotePageClient } from "@/components/NotePage";
import { ROOT } from "@/lib/paths";
import { DEPT_LIST, getDeptBySlug } from "@/lib/constants";

function getNotlarPath(dept: typeof DEPT_LIST[number]): string {
  return path.join(ROOT, dept.dir, dept.notlarDir);
}

export function generateStaticParams() {
  const params: { path: string[] }[] = [];
  for (const dept of DEPT_LIST) {
    const dirPath = getNotlarPath(dept);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      params.push({ path: [dept.slug, file.replace(/\.md$/, "")] });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path: rawSegments } = await params;
  const segments = rawSegments.map((s) => decodeURIComponent(s));
  const dept = getDeptBySlug(segments[0]);
  if (!dept) return {};

  const slug = segments[1];
  const filePath = path.join(getNotlarPath(dept), slug + ".md");
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, "utf-8");
  const firstLine = content.split("\n").find((l) => l.startsWith("# "));
  const title = firstLine ? firstLine.replace(/^#\s*/, "") : slug.replace(/-/g, " ");

  return {
    title,
    description: `${title} — ${dept.label} ders notu. ADÜ Dahiliye.`,
  };
}

interface SidebarItem {
  dir: string;
  dirLabel: string;
  files: { slug: string; title: string }[];
}

function buildSidebar(): SidebarItem[] {
  const items: SidebarItem[] = [];
  for (const dept of DEPT_LIST) {
    const dirPath = getNotlarPath(dept);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md")).sort();
    if (files.length === 0) continue;
    const fileItems = files.map((f) => {
      const content = fs.readFileSync(path.join(dirPath, f), "utf-8");
      const firstLine = content.split("\n").find((l) => l.startsWith("# "));
      const title = firstLine
        ? firstLine.replace(/^#\s*/, "").slice(0, 50)
        : f.replace(/\.md$/, "").replace(/-/g, " ");
      return { slug: f.replace(/\.md$/, ""), title };
    });
    items.push({ dir: dept.slug, dirLabel: dept.label, files: fileItems });
  }
  return items;
}

const HEADING_COLORS = [
  "#e63946", "#e07b00", "#2d9e2d", "#0096c7", "#5a5bd4", "#9b4dca", "#d63384", "#b5a200",
];

interface TocItem { id: string; text: string; level: number; color: string; }

function processMarkdown(md: string, dept: typeof DEPT_LIST[number], noteSlug: string): { html: string; toc: TocItem[] } {
  const lines = md.split("\n");
  const htmlLines: string[] = [];
  const toc: TocItem[] = [];
  let colorIdx = 0;

  const convert = (text: string) =>
    text
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
        let imgSrc = src;
        if (!src.startsWith("/") && !src.startsWith("http")) {
          imgSrc = `/${dept.slug}/${dept.notlarDir}/${src}`;
        }
        return `<img src="${imgSrc}" alt="${alt}" class="max-w-full rounded my-3 shadow-sm" loading="lazy" />`;
      })
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>');

  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeStartLine = 0;
  let tableBuf: { lineNum: number; cells: string[] }[] = [];

  function flushTable() {
    if (tableBuf.length === 0) return;
    const header = tableBuf[0];
    const bodyRows = tableBuf.filter((_, i) => i >= 2);

    let anchors = "";
    for (const row of tableBuf) {
      anchors += `<span id="L${row.lineNum}"></span>`;
    }

    let tableHtml = `${anchors}<div class="my-4 overflow-x-auto"><table class="w-full text-sm border-collapse">`;
    tableHtml += `<thead><tr>`;
    for (const cell of header.cells) {
      tableHtml += `<th class="text-left px-3 py-2 font-semibold text-gray-800 border-b-2 border-gray-300 text-xs" scope="col">${convert(cell)}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;

    for (let r = 0; r < bodyRows.length; r++) {
      const row = bodyRows[r];
      tableHtml += `<tr id="L${row.lineNum}">`;
      for (const cell of row.cells) {
        tableHtml += `<td class="px-3 py-2 text-gray-700 border-b border-gray-100 text-xs">${convert(cell)}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table></div>`;
    htmlLines.push(tableHtml);
    tableBuf = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];
    const id = `L${lineNum}`;

    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLines = [];
        codeStartLine = lineNum;
        continue;
      } else {
        inCodeBlock = false;
        let codeAnchors = "";
        for (let cl = codeStartLine; cl <= lineNum; cl++) {
          codeAnchors += `<span id="L${cl}"></span>`;
        }
        htmlLines.push(
          `${codeAnchors}<div class="my-3"><pre class="rounded-lg p-4 text-xs leading-relaxed overflow-x-auto text-gray-100" style="background:#1e293b"><code>${codeLines.join("\n").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre></div>`
        );
        continue;
      }
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("|")) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      const isSeparator = cells.every((c) => /^[-:]+$/.test(c));
      tableBuf.push({ lineNum, cells });
      if (isSeparator && tableBuf.length === 2) continue;
      continue;
    } else if (tableBuf.length > 0) {
      flushTable();
    }

    if (!line.trim()) {
      if (tableBuf.length > 0) flushTable();
      htmlLines.push(`<div id="${id}" class="h-2"></div>`);
      continue;
    }

    let content = "";
    let cls = "text-gray-800 leading-relaxed text-[15px]";
    let tag = "div";

    if (line.startsWith("###### ")) {
      content = convert(line.slice(7));
      cls = "text-sm font-semibold text-gray-700 mt-3 mb-1";
      tag = "h6";
    } else if (line.startsWith("##### ")) {
      content = convert(line.slice(6));
      cls = "text-sm font-semibold text-gray-800 mt-4 mb-1";
      tag = "h5";
    } else if (line.startsWith("#### ")) {
      content = convert(line.slice(5));
      cls = "text-base font-semibold text-gray-800 mt-5 mb-1";
      tag = "h4";
    } else if (line.startsWith("### ")) {
      content = convert(line.slice(4));
      cls = "text-lg font-semibold text-gray-800 mt-7 mb-2";
      tag = "h3";
    } else if (line.startsWith("## ")) {
      const color = HEADING_COLORS[colorIdx++ % HEADING_COLORS.length];
      const rawText = line.slice(3).replace(/\*\*/g, "");
      toc.push({ id, text: rawText, level: 2, color });
      content = `<span style="color:${color}">${convert(line.slice(3))}</span>`;
      cls = "text-xl font-bold mt-10 mb-3 pb-2 border-b border-gray-200";
      tag = "h2";
    } else if (line.startsWith("# ")) {
      const color = HEADING_COLORS[colorIdx++ % HEADING_COLORS.length];
      const rawText = line.slice(2).replace(/\*\*/g, "");
      toc.push({ id, text: rawText, level: 1, color });
      content = `<span style="color:${color}">${convert(line.slice(2))}</span>`;
      cls = "text-2xl font-bold mb-4";
      tag = "h1";
    } else if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      htmlLines.push(`<div id="${id}"><hr class="my-6 border-gray-200" /></div>`);
      continue;
    } else if (line.startsWith("> ")) {
      content = convert(line.slice(2));
      cls = "border-l-4 border-violet-300 pl-4 py-1.5 text-gray-700 bg-violet-50/50 rounded-r my-1 text-[15px]";
      tag = "blockquote";
    } else if (/^[*-] /.test(line)) {
      content = convert(line.replace(/^[*-] /, ""));
      cls = "text-gray-800 pl-5 text-[15px] before:content-['•'] before:absolute before:left-0 before:text-gray-400 relative";
    } else if (/^\d+\. /.test(line)) {
      content = convert(line);
      cls = "text-gray-800 pl-5 text-[15px]";
    } else {
      content = convert(line);
    }

    htmlLines.push(
      `<div id="${id}" class="flex items-start group">` +
        `<a href="#${id}" class="line-num w-10 flex-shrink-0 text-right pr-3 text-[10px] text-gray-300 group-hover:text-violet-500 select-none pt-1 no-underline hidden" aria-hidden="true" tabindex="-1">${lineNum}</a>` +
        `<${tag} class="flex-1 ${cls}">${content}</${tag}>` +
      `</div>`
    );
  }

  if (tableBuf.length > 0) flushTable();

  return { html: htmlLines.join("\n"), toc };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path: rawSegments } = await params;
  const segments = rawSegments.map((s) => decodeURIComponent(s));
  const dept = getDeptBySlug(segments[0]);
  if (!dept) notFound();

  const noteSlug = segments[1];
  const filePath = path.join(getNotlarPath(dept), noteSlug + ".md");

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const { html, toc } = processMarkdown(content, dept, noteSlug);
  const fileName = `${dept.dir}/${dept.notlarDir}/${noteSlug}.md`;
  const totalLines = content.split("\n").length;
  const sidebar = buildSidebar();

  return (
    <Suspense fallback={<div className="p-8 text-gray-400 text-sm">Yükleniyor...</div>}>
      <NotePageClient
        html={html}
        toc={toc}
        sidebar={sidebar}
        fileName={fileName}
        totalLines={totalLines}
        currentDir={dept.slug}
        currentSlug={noteSlug}
      />
    </Suspense>
  );
}
