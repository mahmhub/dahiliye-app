import type { Metadata } from "next";
import { BubbleLink } from "@/components/BubbleLink";

export const metadata: Metadata = {
  title: "Dahiliye — ADÜ Tıp Fakültesi",
  description:
    "ADÜ Tıp Fakültesi İç Hastalıkları (Dahiliye) ders notları.",
};

function SoapBubble({
  title,
  subtitle,
  sizeClass,
  hueOffset,
}: {
  title: string;
  subtitle?: string;
  sizeClass: string;
  hueOffset: number;
}) {
  return (
    <div
      data-bubble
      className={`relative flex items-center justify-center select-none flex-shrink-0 ${sizeClass}`}
      style={{
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.18)",
        background: `
          radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 18%, transparent 42%),
          radial-gradient(circle at 75% 80%, rgba(255,255,255,0.15) 0%, transparent 28%),
          conic-gradient(
            from ${160 + hueOffset}deg at 50% 50%,
            rgba(255,60,80,0.14) 0deg,
            rgba(255,140,180,0.12) 45deg,
            rgba(255,200,220,0.10) 90deg,
            rgba(220,160,255,0.12) 135deg,
            rgba(180,200,255,0.14) 180deg,
            rgba(200,140,255,0.12) 225deg,
            rgba(255,120,200,0.12) 270deg,
            rgba(255,80,120,0.10) 315deg,
            rgba(255,60,80,0.14) 360deg
          ),
          radial-gradient(circle at 50% 50%, rgba(255,200,220,0.06) 0%, rgba(255,220,235,0.1) 60%, rgba(255,255,255,0.14) 100%)
        `,
        boxShadow: `
          inset 0 0 15px rgba(255,255,255,0.1),
          inset 4px -4px 12px rgba(255,180,220,0.08),
          inset -5px 5px 15px rgba(220,140,255,0.08),
          0 0 10px rgba(255,200,220,0.12),
          0 6px 24px rgba(255,100,150,0.08)
        `,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute", top: "10%", left: "15%", width: "30%", height: "22%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)",
          transform: "rotate(-25deg)", pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", top: "22%", left: "58%", width: "8%", height: "6%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: "8%", left: "25%", width: "50%", height: "12%",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 50%, rgba(255,200,230,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div className="text-center z-10 px-2">
        <span
          className="font-bold drop-shadow-sm leading-tight text-[11px] md:text-[14px]"
          style={{ color: "rgba(80,20,50,0.75)" }}
        >
          {title}
        </span>
        {subtitle && (
          <span className="block text-[8px] md:text-[10px] mt-0.5 font-medium" style={{ color: "rgba(80,20,50,0.45)" }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const mainBubbles = [
    { title: "Çıkmışlar", href: "#", available: false, sizeClass: "w-[110px] h-[110px] md:w-[170px] md:h-[170px]", hue: 0 },
    { title: "Ders Notları", href: "/notlar/", available: true, sizeClass: "w-[130px] h-[130px] md:w-[200px] md:h-[200px]", hue: 40 },
    { title: "Sözlü Çıkmışları", href: "#", available: false, sizeClass: "w-[110px] h-[110px] md:w-[170px] md:h-[170px]", hue: 80 },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="text-center pt-6 pb-2 md:pt-10 md:pb-4">
        <div className="flex flex-col items-center gap-1 mb-4">
          <img src="/logo.png" alt="" aria-hidden="true" className="h-36 md:h-48 w-auto" />
        </div>
        <a
          href="/ders-programi/"
          className="text-4xl md:text-6xl font-bold mb-2 inline-block hover:opacity-80 transition-opacity"
          style={{
            background: "conic-gradient(from 200deg, rgba(255,60,80,0.85), rgba(255,140,180,0.85), rgba(220,160,255,0.85), rgba(180,200,255,0.85), rgba(255,120,200,0.85), rgba(255,60,80,0.85))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textDecoration: "none",
          }}
        >
          Dahiliye
        </a>
      </div>

      {/* Main Bubbles — triangle: 2 top, 1 bottom center */}
      <section className="flex flex-col items-center my-8 md:my-14">
        {/* Top row */}
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {[mainBubbles[0], mainBubbles[2]].map((b) => (
            <BubbleLink key={b.title} href={b.href} disabled={!b.available}>
              <div style={{ opacity: b.available ? 1 : 0.6 }}>
                <SoapBubble title={b.title} subtitle={b.available ? undefined : "Yakında"} sizeClass={b.sizeClass} hueOffset={b.hue} />
              </div>
            </BubbleLink>
          ))}
        </div>
        {/* Bottom row */}
        <div className="-mt-3 md:-mt-5">
          {(() => {
            const b = mainBubbles[1];
            return (
              <BubbleLink href={b.href} disabled={!b.available}>
                <div style={{ opacity: b.available ? 1 : 0.6 }}>
                  <SoapBubble title={b.title} subtitle={b.available ? undefined : "Yakında"} sizeClass={b.sizeClass} hueOffset={b.hue} />
                </div>
              </BubbleLink>
            );
          })()}
        </div>
      </section>

      <div className="pb-12"></div>
    </div>
  );
}
