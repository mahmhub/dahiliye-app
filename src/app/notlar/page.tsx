import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { BubbleLink } from "@/components/BubbleLink";
import { DEPT_LIST } from "@/lib/constants";
import { ROOT } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Ders Notları",
  description: "ADÜ Dahiliye ders notları — tüm anabilim dalları.",
};

// Her bölüm için farklı soft renk paleti
// [primary r,g,b] — conic gradient ve glow için kullanılacak
const BUBBLE_PALETTES: [number, number, number][] = [
  [255, 140, 80],   // turuncu-şeftali
  [80, 180, 220],   // açık mavi
  [160, 120, 255],  // lavanta-mor
  [255, 100, 130],  // pembe-mercan
  [100, 200, 160],  // mint-yeşil
  [220, 160, 80],   // altın-sarı
  [180, 130, 200],  // lila
  [120, 190, 240],  // gök mavisi
];

function Bubble({
  label,
  subtitle,
  colorIndex,
  active,
}: {
  label: string;
  subtitle: string;
  colorIndex: number;
  active: boolean;
}) {
  const [r, g, b] = BUBBLE_PALETTES[colorIndex % BUBBLE_PALETTES.length];

  return (
    <div
      data-bubble
      className="relative flex items-center justify-center select-none w-[140px] h-[140px] md:w-[150px] md:h-[150px]"
      style={{
        borderRadius: "50%",
        border: `1px solid rgba(${r},${g},${b},0.2)`,
        opacity: active ? 1 : 0.4,
        background: `
          radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 18%, transparent 42%),
          radial-gradient(circle at 75% 80%, rgba(255,255,255,0.15) 0%, transparent 28%),
          conic-gradient(
            from 180deg at 50% 50%,
            rgba(${r},${g},${b},0.16) 0deg,
            rgba(${Math.min(r+40,255)},${Math.min(g+40,255)},${Math.min(b+40,255)},0.12) 60deg,
            rgba(255,255,255,0.08) 120deg,
            rgba(${Math.max(r-40,0)},${Math.max(g-20,0)},${Math.min(b+60,255)},0.12) 180deg,
            rgba(${r},${Math.min(g+30,255)},${Math.min(b+30,255)},0.14) 240deg,
            rgba(${Math.min(r+20,255)},${g},${Math.max(b-30,0)},0.10) 300deg,
            rgba(${r},${g},${b},0.16) 360deg
          ),
          radial-gradient(circle at 50% 50%, rgba(${r},${g},${b},0.04) 0%, rgba(${r},${g},${b},0.08) 60%, rgba(255,255,255,0.12) 100%)
        `,
        boxShadow: `
          inset 0 0 13px rgba(255,255,255,0.1),
          inset 4px -4px 10px rgba(${r},${g},${b},0.08),
          inset -5px 5px 13px rgba(${r},${g},${b},0.08),
          0 0 8px rgba(${r},${g},${b},0.12),
          0 5px 20px rgba(${r},${g},${b},0.08)
        `,
        cursor: active ? "pointer" : "default",
      }}
    >
      <div style={{ position: "absolute", top: "10%", left: "15%", width: "30%", height: "22%", borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)", transform: "rotate(-25deg)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "22%", left: "58%", width: "8%", height: "6%", borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "8%", left: "25%", width: "50%", height: "12%", borderRadius: "50%", background: `radial-gradient(ellipse at 50% 50%, rgba(${r},${g},${b},0.12) 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div className="text-center z-10 px-2">
        <span className="font-bold drop-shadow-sm leading-tight block bubble-text text-[10px] md:text-[12px]">
          {label}
        </span>
        <span className="block mt-0.5 font-medium bubble-text-muted text-[8px] md:text-[10px]">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

export default function NotlarPage() {
  const depts = DEPT_LIST.map((dept, i) => {
    const dirPath = path.join(ROOT, dept.dir, dept.notlarDir);
    let noteCount = 0;
    if (fs.existsSync(dirPath)) {
      noteCount = fs.readdirSync(dirPath).filter((f) => f.endsWith(".md")).length;
    }
    return { ...dept, noteCount, index: i };
  });

  // Desktop: 2-3-2, Mobile: 2-2-2-2
  const desktopRows = [
    depts.slice(0, 2),
    depts.slice(2, 5),
    depts.slice(5),
  ];
  const mobileRows = [
    depts.slice(0, 2),
    depts.slice(2, 4),
    depts.slice(4, 6),
    depts.slice(6),
  ];

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-xs text-gray-400">
          <li><a href="/" className="hover:text-gray-600 transition-colors">Ana Sayfa</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-gray-600 font-medium" aria-current="page">Ders Notları</li>
        </ol>
      </nav>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ders Notları</h1>
      </div>

      {/* Desktop layout: 2-3-2 */}
      <section className="hidden md:flex flex-col items-center my-14 gap-4">
        {desktopRows.map((row, ri) => (
          <div key={ri} className="flex items-center justify-center gap-5">
            {row.map((dept) => {
              const hasNotes = dept.noteCount > 0;
              return (
                <BubbleLink key={dept.slug} href={`/notlar/${dept.slug}/`} disabled={!hasNotes}>
                  <Bubble label={dept.label} subtitle={hasNotes ? `${dept.noteCount} not` : "Yakında"} colorIndex={dept.index} active={hasNotes} />
                </BubbleLink>
              );
            })}
          </div>
        ))}
      </section>

      {/* Mobile layout: 2-2-2-2 */}
      <section className="flex md:hidden flex-col items-center my-8 gap-3">
        {mobileRows.map((row, ri) => (
          <div key={ri} className="flex items-center justify-center gap-3">
            {row.map((dept) => {
              const hasNotes = dept.noteCount > 0;
              return (
                <BubbleLink key={dept.slug} href={`/notlar/${dept.slug}/`} disabled={!hasNotes}>
                  <Bubble label={dept.label} subtitle={hasNotes ? `${dept.noteCount} not` : "Yakında"} colorIndex={dept.index} active={hasNotes} />
                </BubbleLink>
              );
            })}
          </div>
        ))}
      </section>
    </div>
  );
}
