/**
 * vue-i18n setup and language registry.
 * Translation JSON files live in ./locales/*.json
 */
import { createI18n, type I18nOptions } from "vue-i18n";
import { language as defaultLanguage } from "@/config/defaults";

// Locales - Import translation files here
import en from "./locales/en.json";

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
    flag: "🇬🇧",
  },
];

// Prepare each language for export
const i18nMessages: Record<string, Record<string, unknown>> = {};
languages.forEach((lang) => {
  i18nMessages[lang.code] = lang.locale;
});
export const messages = i18nMessages;

// Setup i18n translations
export const i18n = createI18n({
  legacy: false, // Use Composition API mode, so useI18n() works in <script setup>
  globalInjection: true, // Exposes $t etc. to templates, for legacy-style usage
  locale: defaultLanguage,
  fallbackLocale: defaultLanguage,
  messages: messages as unknown as I18nOptions["messages"],
});

export default i18n;
