import ErrorHandler from "@/utils/ErrorHandler";
import { getTheme, getCustomColors } from "@/config/ConfigHelpers";
import { mainCssVars } from "@/config/defaults";

/* Returns users current theme */
export const GetTheme = (): string => getTheme();

/* Gets user custom color preferences for current theme, and applies to DOM */
export const ApplyCustomVariables = (theme: string) => {
  mainCssVars.forEach((vName) => { document.documentElement.style.removeProperty(`--${vName}`); });
  const themeColors = getCustomColors()[theme];
  if (themeColors) {
    Object.keys(themeColors).forEach((customVar) => {
      document.documentElement.style.setProperty(`--${customVar}`, themeColors[customVar]);
    });
  }
};

/* Sets the theme, by updating data-theme attribute on the html tag */
export const ApplyLocalTheme = (newTheme: string) => {
  const htmlTag = document.getElementsByTagName("html")[0];
  if (htmlTag.hasAttribute("data-theme")) htmlTag.removeAttribute("data-theme");
  htmlTag.setAttribute("data-theme", newTheme);
};

/**
 * A function for pre-loading, and easy switching of external stylesheets
 * External CSS is preloaded to avoid FOUC
 */
export const LoadExternalTheme = function th() {
  /* Preload selected external theme */
  const preloadTheme = (href: string): Promise<CSSStyleSheet> => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = href;
    document.head.appendChild(link);
    return new Promise((resolve, reject) => {
      link.onload = (e: Event) => {
        const { sheet } = e.target as HTMLLinkElement;
        if (sheet) {
          sheet.disabled = true;
          resolve(sheet);
        }
      };
      link.onerror = (e: Event | string) => reject(e);
    });
  };

  /* Check theme is selected, and it exists */
  const checkTheme = (themes: Record<string, CSSStyleSheet>, name?: string): boolean => {
    if ((!name) || (name !== "custom" && !themes[name])) {
      ErrorHandler(`Theme: '${name || "[not selected]"}' does not exist.`);
      return false;
    }
    return true;
  };

  /* Disable all but selected theme */
  const selectTheme = (themes: Record<string, CSSStyleSheet>, name?: string) => {
    if (checkTheme(themes, name)) {
      const t = themes; // To avoid ESLint complaining about mutating a param
      Object.keys(themes).forEach((n) => { t[n].disabled = (n !== name); });
    }
  };

  const themes: Record<string, CSSStyleSheet> = {};

  return {
    add(name: string, href: string) { return preloadTheme(href).then((s) => { themes[name] = s; }); },
    set theme(name: string | undefined) { selectTheme(themes, name); },
    get theme(): string | undefined { return Object.keys(themes).find((n) => !themes[n].disabled); },
  };
};
