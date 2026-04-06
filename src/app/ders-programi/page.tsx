import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { ROOT } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Ders Programı — V. Blok",
  description: "ADÜ Dahiliye V. Blok teorik ders programı.",
};

interface Lesson {
  date: string;
  day: string;
  time: string;
  dept: string;
  topic: string;
  instructor: string;
  noteHref: string | null;
}

interface Week {
  title: string;
  lessons: Lesson[];
  note: string | null;
}

// Ders konusu → not dosyası eşleştirmesi
const TOPIC_MAP: [RegExp, string][] = [
  [/anamnez.*değerlendirme|genel dahili yaklaşım/i, "/not/genel-dahiliye/anamnez-ve-hasta-degerlendirme/"],
  [/sepsis/i, "/not/genel-dahiliye/sepsis/"],
  [/şok/i, "/not/genel-dahiliye/sok-ve-sok-tipleri/"],
  [/halsizlik.*kilo|kilo.*kayb/i, "/not/genel-dahiliye/kilo-kaybi-ve-halsizlik/"],
  [/akut böbrek hasar/i, "/not/nefroloji/abh/"],
  [/tübülointerstisyel|interstisyel/i, "/not/nefroloji/interstisyel-nefrit/"],
  [/asit.?baz/i, "/not/nefroloji/asit-baz-dengesi/"],
  [/esansiyel hipertansiyon/i, "/not/genel-dahiliye/esansiyel-hipertansiyon/"],
  [/asitli hasta/i, "/not/genel-dahiliye/asitli-hastaya-yaklasim/"],
  [/koruyucu hekimlik/i, "/not/genel-dahiliye/koruyucu-hekimlik-uygulamalari/"],
  [/erişkin aşılama|aşılama/i, "/not/genel-dahiliye/eriskin-asilama/"],
  [/ödemli hasta/i, "/not/genel-dahiliye/odemli-hastaya-yaklasim/"],
  [/malnutrisyon|beslenme/i, "/not/genel-dahiliye/beslenme-1/"],
  [/hemodinamik monitorizasyon|dahili yoğun bakım/i, "/not/genel-dahiliye/dahili-yogun-bakim/"],
  [/olgu sunumu|vaka tartışması.*genel/i, "/not/genel-dahiliye/olgu-sunumu/"],
];

function findNoteHref(topic: string): string | null {
  for (const [regex, href] of TOPIC_MAP) {
    if (regex.test(topic)) return href;
  }
  return null;
}

function parseSchedule(content: string): Week[] {
  const weeks: Week[] = [];
  const sections = content.split(/^## /m).slice(1);

  for (const section of sections) {
    const lines = section.split("\n");
    const title = lines[0].trim();
    const lessons: Lesson[] = [];
    let weekNote: string | null = null;

    for (const line of lines) {
      // Parse table rows
      if (line.startsWith("|") && !line.includes("---") && !line.includes("Tarih")) {
        const cells = line.split("|").slice(1, -1).map((c) => c.trim());
        if (cells.length >= 6) {
          const topic = cells[4].replace(/\*\*/g, "");
          lessons.push({
            date: cells[0],
            day: cells[1],
            time: cells[2],
            dept: cells[3],
            topic,
            instructor: cells[5],
            noteHref: findNoteHref(topic),
          });
        }
      }
      // Parse notes
      if (line.startsWith("> **Not:**")) {
        weekNote = line.replace(/^>\s*\*\*Not:\*\*\s*/, "").trim();
      }
    }

    if (lessons.length > 0 || weekNote) {
      weeks.push({ title, lessons, note: weekNote });
    }
  }

  return weeks;
}

// Renk: anabilim dalına göre
const DEPT_COLORS: Record<string, string> = {
  "Genel Dahiliye": "rgba(255,60,80,0.08)",
  "Nefroloji": "rgba(100,180,255,0.08)",
  "Gastroenteroloji": "rgba(255,180,60,0.08)",
  "Hematoloji": "rgba(220,60,255,0.08)",
  "Endokrinoloji": "rgba(60,200,180,0.08)",
  "Tıbbi Onkoloji": "rgba(255,100,100,0.08)",
  "İmmünoloji ve Alerji Hast.": "rgba(100,200,255,0.08)",
  "Romatoloji": "rgba(180,140,255,0.08)",
  "İç Hastalıkları": "rgba(200,200,200,0.08)",
};

const DEPT_BORDER: Record<string, string> = {
  "Genel Dahiliye": "rgba(255,60,80,0.25)",
  "Nefroloji": "rgba(100,180,255,0.25)",
  "Gastroenteroloji": "rgba(255,180,60,0.25)",
  "Hematoloji": "rgba(220,60,255,0.25)",
  "Endokrinoloji": "rgba(60,200,180,0.25)",
  "Tıbbi Onkoloji": "rgba(255,100,100,0.25)",
  "İmmünoloji ve Alerji Hast.": "rgba(100,200,255,0.25)",
  "Romatoloji": "rgba(180,140,255,0.25)",
  "İç Hastalıkları": "rgba(200,200,200,0.25)",
};

export default function DersProgramiPage() {
  const filePath = path.join(ROOT, "v-blok-teorik-dersler.md");
  if (!fs.existsSync(filePath)) {
    return <p className="text-center text-gray-400 py-8">Ders programı bulunamadı.</p>;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const weeks = parseSchedule(content);

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-xs text-gray-400">
          <li><a href="/" className="hover:text-gray-600 transition-colors">Ana Sayfa</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-600 font-medium" aria-current="page">Ders Programı</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">V. Blok — Ders Programı</h1>
        <p className="text-sm text-gray-500">Konuya tıklayarak ders notuna gidebilirsiniz.</p>
      </div>

      <div className="flex flex-col gap-10">
        {weeks.map((week) => (
          <section key={week.title}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">{week.title}</h2>

            {week.note && (
              <p className="text-xs text-gray-500 mb-3 px-1">{week.note}</p>
            )}

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 0 8px rgba(255,200,220,0.1)" }}>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ background: "rgba(255,200,220,0.06)" }}>
                    <th className="text-left px-3 py-2 text-xs font-semibold bubble-text-muted" style={{ width: "90px" }}>Tarih</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold bubble-text-muted" style={{ width: "70px" }}>Saat</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold bubble-text-muted" style={{ width: "130px" }}>Anabilim Dalı</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold bubble-text-muted">Ders Konusu</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold bubble-text-muted" style={{ width: "160px" }}>Öğretim Üyesi</th>
                  </tr>
                </thead>
                <tbody>
                  {week.lessons.map((lesson, i) => {
                    const bg = DEPT_COLORS[lesson.dept] || "transparent";
                    const borderColor = DEPT_BORDER[lesson.dept] || "transparent";
                    return (
                      <tr key={i} style={{ background: bg, borderBottom: `1px solid ${borderColor}` }}>
                        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                          {lesson.date}<br /><span className="text-gray-400">{lesson.day}</span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">{lesson.time}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{lesson.dept}</td>
                        <td className="px-3 py-2 text-sm">
                          {lesson.noteHref ? (
                            <Link href={lesson.noteHref} className="font-medium transition-colors hover:opacity-70" style={{ color: "rgba(200,50,100,0.85)", textDecoration: "underline", textDecorationColor: "rgba(200,50,100,0.3)", textUnderlineOffset: "2px" }}>
                              {lesson.topic}
                            </Link>
                          ) : (
                            <span className="text-gray-700">{lesson.topic}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-500">{lesson.instructor}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="md:hidden flex flex-col gap-2">
              {week.lessons.map((lesson, i) => {
                const bg = DEPT_COLORS[lesson.dept] || "transparent";
                const borderColor = DEPT_BORDER[lesson.dept] || "transparent";
                const inner = (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-3"
                    style={{ background: bg, border: `1px solid ${borderColor}` }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-gray-500">{lesson.date} {lesson.day}</span>
                      <span className="text-[11px] text-gray-400">{lesson.time}</span>
                    </div>
                    <div className="text-sm font-medium mb-1">
                      {lesson.noteHref ? (
                        <Link href={lesson.noteHref} className="transition-colors hover:opacity-70" style={{ color: "rgba(200,50,100,0.85)", textDecoration: "underline", textDecorationColor: "rgba(200,50,100,0.3)", textUnderlineOffset: "2px" }}>
                          {lesson.topic}
                        </Link>
                      ) : (
                        <span className="text-gray-800">{lesson.topic}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">{lesson.dept}</span>
                      <span className="text-[11px] text-gray-400">{lesson.instructor}</span>
                    </div>
                  </div>
                );
                return inner;
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="pb-12"></div>
    </div>
  );
}
