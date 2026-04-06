import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DEPT_LIST, getDeptBySlug } from "@/lib/constants";
import { ROOT } from "@/lib/paths";

export function generateStaticParams() {
  return DEPT_LIST.map((d) => ({ dept: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dept: string }>;
}): Promise<Metadata> {
  const { dept: slug } = await params;
  const dept = getDeptBySlug(slug);
  if (!dept) return {};
  return {
    title: `${dept.label} — Ders Notları`,
    description: `ADÜ Dahiliye ${dept.label} ders notları.`,
  };
}

function extractInstructor(content: string): string {
  const match = content.match(/\*\*Hazırlayan:\*\*\s*(.+)/);
  if (!match) return "Diğer";
  return match[1].replace(/\(.*?\)/g, "").trim();
}

export default async function DeptNotlarPage({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept: slug } = await params;
  const dept = getDeptBySlug(slug);
  if (!dept) notFound();

  const dirPath = path.join(ROOT, dept.dir, dept.notlarDir);
  if (!fs.existsSync(dirPath)) notFound();

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md")).sort();
  const notes = files.map((f) => {
    const content = fs.readFileSync(path.join(dirPath, f), "utf-8");
    const firstLine = content.split("\n").find((l) => l.startsWith("# "));
    const title = firstLine
      ? firstLine.replace(/^#\s*/, "").slice(0, 60)
      : f.replace(/\.md$/, "").replace(/-/g, " ");
    const lineCount = content.split("\n").length;
    const instructor = extractInstructor(content);
    return { slug: f.replace(/\.md$/, ""), title, lineCount, instructor };
  });

  // Group by instructor
  const grouped: { instructor: string; notes: typeof notes }[] = [];
  const instructorMap = new Map<string, typeof notes>();
  for (const note of notes) {
    const existing = instructorMap.get(note.instructor);
    if (existing) {
      existing.push(note);
    } else {
      instructorMap.set(note.instructor, [note]);
    }
  }
  for (const [instructor, items] of instructorMap) {
    grouped.push({ instructor, notes: items });
  }

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-xs text-gray-400">
          <li><a href="/" className="hover:text-gray-600 transition-colors">Ana Sayfa</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/notlar/" className="hover:text-gray-600 transition-colors">Ders Notları</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-600 font-medium" aria-current="page">{dept.label}</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{dept.label}</h1>
      </div>

      {notes.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Henüz ders notu eklenmedi.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map((group) => (
            <section key={group.instructor}>
              <h2
                className="text-sm font-semibold mb-3 px-1 bubble-text-muted"
              >
                {group.instructor}
              </h2>
              <div className="flex flex-col gap-2">
                {group.notes.map((note) => (
                  <Link
                    key={note.slug}
                    href={`/not/${dept.slug}/${note.slug}/`}
                    className="relative flex items-center justify-between rounded-2xl px-5 py-3.5 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 min-h-[52px] overflow-hidden"
                    style={{
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: `
                        radial-gradient(circle at 15% 40%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 25%, transparent 50%),
                        conic-gradient(from 200deg at 50% 50%,
                          rgba(255,60,80,0.10) 0deg, rgba(255,140,180,0.08) 60deg,
                          rgba(255,200,220,0.07) 120deg, rgba(220,160,255,0.08) 180deg,
                          rgba(180,200,255,0.10) 240deg, rgba(255,120,200,0.08) 300deg,
                          rgba(255,60,80,0.10) 360deg),
                        radial-gradient(circle at 50% 50%, rgba(255,200,220,0.05) 0%, rgba(255,220,235,0.08) 60%, rgba(255,255,255,0.12) 100%)
                      `,
                      boxShadow: `
                        inset 0 0 15px rgba(255,255,255,0.08),
                        inset 3px -3px 10px rgba(255,180,220,0.06),
                        inset -4px 4px 12px rgba(220,140,255,0.06),
                        0 0 6px rgba(255,200,220,0.1),
                        0 3px 12px rgba(255,100,150,0.06)
                      `,
                    }}
                  >
                    <h3 className="font-medium text-sm z-10 bubble-text">{note.title}</h3>
                    <span className="text-xs flex-shrink-0 ml-4 z-10 bubble-text-muted">{note.lineCount} satır</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
