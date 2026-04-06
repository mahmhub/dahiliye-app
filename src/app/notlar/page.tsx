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

function Bubble({
  label,
  subtitle,
  hue,
  delay,
  active,
}: {
  label: string;
  subtitle: string;
  hue: number;
  delay: string;
  active: boolean;
}) {
  const size = 130;
  return (
    <div
      data-bubble
    className="relative flex items-center justify-center select-none"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.18)",
        opacity: active ? 1 : 0.4,
        background: `
          radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 18%, transparent 42%),
          radial-gradient(circle at 75% 80%, rgba(255,255,255,0.15) 0%, transparent 28%),
          conic-gradient(
            from ${160 + hue}deg at 50% 50%,
            rgba(255,60,80,0.14) 0deg, rgba(255,140,180,0.12) 45deg,
            rgba(255,200,220,0.10) 90deg, rgba(220,160,255,0.12) 135deg,
            rgba(180,200,255,0.14) 180deg, rgba(200,140,255,0.12) 225deg,
            rgba(255,120,200,0.12) 270deg, rgba(255,80,120,0.10) 315deg,
            rgba(255,60,80,0.14) 360deg
          ),
          radial-gradient(circle at 50% 50%, rgba(255,200,220,0.06) 0%, rgba(255,220,235,0.1) 60%, rgba(255,255,255,0.14) 100%)
        `,
        boxShadow: `
          inset 0 0 13px rgba(255,255,255,0.1),
          inset 4px -4px 10px rgba(255,180,220,0.08),
          inset -5px 5px 13px rgba(220,140,255,0.08),
          0 0 8px rgba(255,200,220,0.12),
          0 5px 20px rgba(255,100,150,0.08)
        `,
        cursor: active ? "pointer" : "default",
      }}
    >
      <div style={{ position: "absolute", top: "10%", left: "15%", width: "30%", height: "22%", borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)", transform: "rotate(-25deg)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "22%", left: "58%", width: "8%", height: "6%", borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "8%", left: "25%", width: "50%", height: "12%", borderRadius: "50%", background: "radial-gradient(ellipse at 50% 50%, rgba(255,200,230,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div className="text-center z-10 px-2">
        <span className="font-bold drop-shadow-sm leading-tight block" style={{ color: "rgba(80,20,50,0.75)", fontSize: "12px" }}>
          {label}
        </span>
        <span className="block mt-0.5 font-medium" style={{ color: "rgba(80,20,50,0.45)", fontSize: "10px" }}>
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

  // 2-3-2 layout (last item goes to row 3 if 8 items → 3-3-2)
  const rows = [
    depts.slice(0, 2),
    depts.slice(2, 5),
    depts.slice(5),
  ];

  const rowGap = 16;   // vertical gap between rows (px)
  const itemGap = 20;  // horizontal gap between bubbles (px)

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

      <section className="flex flex-col items-center my-10 md:my-14" style={{ gap: `${rowGap}px` }}>
        {rows.map((row, ri) => (
          <div key={ri} className="flex items-center justify-center" style={{ gap: `${itemGap}px` }}>
            {row.map((dept) => {
              const hasNotes = dept.noteCount > 0;
              const hue = dept.index * 45;
              const delay = `${dept.index * 0.15}s`;
              const subtitle = hasNotes ? `${dept.noteCount} not` : "Yakında";

              const bubble = (
                <Bubble label={dept.label} subtitle={subtitle} hue={hue} delay={delay} active={hasNotes} />
              );

              return (
                <BubbleLink key={dept.slug} href={`/notlar/${dept.slug}/`} disabled={!hasNotes}>
                  {bubble}
                </BubbleLink>
              );
            })}
          </div>
        ))}
      </section>
    </div>
  );
}
