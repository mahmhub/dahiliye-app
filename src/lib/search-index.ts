import fs from "fs";
import path from "path";
import { DEPT_LIST } from "./constants";
import { ROOT } from "./paths";

export interface SearchEntry {
  type: "topic" | "note" | "question";
  title: string;
  snippet?: string;
  href: string;
  department?: string;
  meta?: string;
  keywords?: string;
}

function indexNoteFile(
  filePath: string,
  dir: string,
  slug: string,
  label: string,
): SearchEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const entries: SearchEntry[] = [];

  const firstLine = lines.find((l) => l.startsWith("# "));
  const noteTitle = firstLine
    ? firstLine.replace(/^#\s*/, "").slice(0, 80)
    : slug.replace(/-/g, " ");
  const baseHref = `/not/${dir}/${slug}/`;

  entries.push({
    type: "note",
    title: noteTitle,
    href: baseHref,
    department: label,
  });

  // Index each heading with its line number
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^(#{2,4})\s+(.+)/);
    if (!match) continue;
    const headingText = match[2].replace(/\*\*/g, "").trim();
    if (headingText.length < 3) continue;
    const lineNum = i + 1;

    const sectionKeywords: string[] = [];
    for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
      if (/^#{1,4}\s/.test(lines[j].trim())) break;
      const bolds = lines[j].match(/\*\*([^*]+)\*\*/g);
      if (bolds) {
        for (const b of bolds) {
          const term = b.replace(/\*\*/g, "").trim();
          if (term.length > 2 && term.length < 60) sectionKeywords.push(term);
        }
      }
    }

    entries.push({
      type: "note",
      title: headingText,
      snippet: noteTitle,
      href: `${baseHref}#L${lineNum}`,
      department: label,
      keywords: sectionKeywords.join(" ").slice(0, 400),
    });
  }

  return entries;
}

export function generateSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const dept of DEPT_LIST) {
    const dirPath = path.join(ROOT, dept.dir, dept.notlarDir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md"));
    for (const f of files) {
      const slug = f.replace(/\.md$/, "");
      entries.push(...indexNoteFile(path.join(dirPath, f), dept.slug, slug, dept.label));
    }
  }

  return entries;
}
