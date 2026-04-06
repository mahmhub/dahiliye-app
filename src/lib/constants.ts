export const DEPT_STYLES: Record<string, string> = {
  "Gastroenteroloji": "var(--mustard-light)",
  "Endokrinoloji": "var(--turquoise-light)",
  "Nefroloji": "var(--aqua-light)",
  "Hematoloji": "var(--petal-light)",
  "Romatoloji": "var(--mauve-light)",
  "Onkoloji": "var(--petal-light)",
  "Alerji ve İmmünoloji": "var(--aqua-light)",
  "Genel Dahiliye": "var(--turquoise-light)",
};

// slug: URL-safe tanımlayıcı, dir: filesystem klasör adı
export const DEPT_LIST: { slug: string; dir: string; notlarDir: string; label: string; color: string }[] = [
  { slug: "gastroenteroloji", dir: "Gastroenteroloji", notlarDir: "notlar", label: "Gastroenteroloji", color: DEPT_STYLES["Gastroenteroloji"] },
  { slug: "endokrinoloji", dir: "Endokrinoloji", notlarDir: "notlar", label: "Endokrinoloji", color: DEPT_STYLES["Endokrinoloji"] },
  { slug: "nefroloji", dir: "Nefroloji", notlarDir: "notlar", label: "Nefroloji", color: DEPT_STYLES["Nefroloji"] },
  { slug: "hematoloji", dir: "Hematoloji", notlarDir: "notlar", label: "Hematoloji", color: DEPT_STYLES["Hematoloji"] },
  { slug: "romatoloji", dir: "Romatoloji", notlarDir: "notlar", label: "Romatoloji", color: DEPT_STYLES["Romatoloji"] },
  { slug: "onkoloji", dir: "Onkoloji", notlarDir: "notlar", label: "Onkoloji", color: DEPT_STYLES["Onkoloji"] },
  { slug: "immunoloji-alerji", dir: "İmmunoloji ve Alerji", notlarDir: "notlar", label: "Alerji ve İmmünoloji", color: DEPT_STYLES["Alerji ve İmmünoloji"] },
  { slug: "genel-dahiliye", dir: "Genel Dahiliye", notlarDir: "notlar", label: "Genel Dahiliye", color: DEPT_STYLES["Genel Dahiliye"] },
];

export function getDeptBySlug(slug: string) {
  return DEPT_LIST.find((d) => d.slug === slug);
}

export function getDeptColor(department: string): string {
  return DEPT_STYLES[department] || "var(--porcelain)";
}
