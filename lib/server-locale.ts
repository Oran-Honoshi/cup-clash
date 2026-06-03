import { cookies } from "next/headers";
import { TRANSLATIONS, LOCALES, type Locale, type Translations, interpolate } from "@/lib/i18n";

export function getServerLocale(): Locale {
  try {
    const cookieStore = cookies();
    const saved = cookieStore.get("cupclash_locale")?.value as Locale | undefined;
    if (saved && saved in LOCALES) return saved;
  } catch {}
  return "en";
}

export function serverT(key: keyof Translations): string {
  const locale = getServerLocale();
  return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS.en[key] ?? key;
}

export { interpolate };
