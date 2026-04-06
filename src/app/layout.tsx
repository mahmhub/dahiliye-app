import type { Metadata } from "next";
import "./globals.css";
import { generateSearchIndex } from "@/lib/search-index";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "Dahiliye — ADÜ Tıp Fakültesi",
    template: "%s | Dahiliye ADÜ",
  },
  description:
    "ADÜ Tıp Fakültesi İç Hastalıkları (Dahiliye) ders notları. Gastroenteroloji, Nefroloji, Hematoloji, Endokrinoloji ve daha fazlası.",
  keywords: ["dahiliye", "iç hastalıkları", "tıp fakültesi", "ders notları", "ADÜ"],
  openGraph: {
    title: "Dahiliye — ADÜ Tıp Fakültesi",
    description: "İç Hastalıkları ders notları — tüm anabilim dalları.",
    type: "website",
    locale: "tr_TR",
  },
};

const searchIndex = generateSearchIndex();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}})()` }} />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className="antialiased" style={{ background: "var(--surface)", color: "var(--text-primary)", fontFamily: "'Avenir Next', 'Avenir', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <a href="#main-content" className="skip-link">
          İçeriğe geç
        </a>

        <header
          className="sticky top-0 z-50 border-b backdrop-blur-sm"
          style={{ borderColor: "var(--border-color)", background: "var(--surface-secondary)" }}
          role="banner"
        >
          <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between">
            <a
              href="/"
              className="hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded flex items-center gap-2"
              aria-label="Dahiliye ana sayfaya dön"
            >
              <img src="/logo.png" alt="Dahiliye" className="h-10 w-auto" />
            </a>
            <Navbar searchEntries={searchIndex} />
          </div>
        </header>

        <main
          id="main-content"
          className="max-w-6xl mx-auto px-4 py-6"
          tabIndex={-1}
        >
          {children}
        </main>

        <footer className="border-t mt-12 no-print" style={{ borderColor: "var(--border-color)", color: "var(--text-tertiary)" }}>
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>Kaynaklar</h4>
                <ul className="space-y-2 text-xs">
                  <li><a href="/notlar/" className="hover:opacity-70 transition-opacity">Ders Notları</a></li>
                  <li><a href="/ders-programi/" className="hover:opacity-70 transition-opacity">Ders Programı</a></li>
                  <li><a href="https://pediatri.drme.space" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">Pediatri</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>İletişim</h4>
                <div className="flex items-center gap-3">
                  <a href="https://instagram.com/drdotme" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" aria-label="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </a>
                  <a href="mailto:mmecn@icloud.com" className="hover:opacity-70 transition-opacity" aria-label="E-posta">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </a>
                  <a href="https://wa.me/905439487656" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" aria-label="WhatsApp">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-4 text-center text-[11px] font-mono tracking-wider" style={{ borderTop: "1px solid var(--border-color)", color: "var(--text-tertiary)" }}>
              built by mahmut ercan
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
