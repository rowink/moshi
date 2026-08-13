// Locales - Import translation files here
import en from "@/assets/locales/en.json";

export interface Language {
  name: string;
  code: string;
  locale: Record<string, unknown>;
  flag: string;
}

// Only English is used by this app
export const languages: Language[] = [
  {
    name: "English",
    code: "en",
    locale: en,
    flag: "馃嚞馃嚙",
  },
];

// Prepare each language for export
const i18nMessages: Record<string, Record<string, unknown>> = {};
languages.forEach((lang) => {
  i18nMessages[lang.code] = lang.locale;
});
export const messages = i18nMessages;
