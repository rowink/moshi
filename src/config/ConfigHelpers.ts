import ConfigAccumulator from "@/config/ConfigAccumalator";
import { languages } from "@/config/languages";
import {
  visibleComponents,
  localStorageKeys,
  theme as defaultTheme,
  language as defaultLanguage,
} from "@/config/defaults";
import ErrorHandler from "@/utils/ErrorHandler";
import ConfigSchema from "@/config/ConfigSchema.json";
import type { Language } from "@/config/languages";

/* Given a page name, converts to lowercase and removes special characters, whitespace and hyphens */
export const makePageName = (pageName?: string): string => {
  if (!pageName) return "unnamed-page";
  const formattedName = pageName
    .toLowerCase()
    .replace(".yml", "")
    .replace(/[^\w\s-]/gi, "")
    .replace(/[\s-]+/g, "");
  return formattedName || "unnamed-page";
};

/* For a given sub-page, return the URL */
export const makePageSlug = (pageName: string): string => {
  const formattedName = makePageName(pageName);
  return `/${formattedName}`;
};

/**
 * Initiates the Accumulator class and generates a complete config object
 * Self-executing function, returns the full user config as a JSON object
 */
export const config = (() => {
  const Accumulator = new ConfigAccumulator();
  return {
    appConfig: Accumulator.appConfig(),
    pageInfo: Accumulator.pageInfo(),
    sections: Accumulator.sections(),
  };
})();

/**
 * Generates an object containing booleans indicating which
 * components should be hidden. This enables the user to hide
 * parts of the page and disable functionality that they don't need/ want
 * All options fallback on the values defined in the defaults
 * @param appConfig The full app config
 * @returns result
 */
export const componentVisibility = (appConfig: Record<string, any>) => {
  // Get users choice from app config
  const usersChoice = appConfig.hideComponents || {};
  // Checks if value is defined, and is a boolean
  const isThere = (userValue: unknown) => typeof userValue === "boolean";
  // For each option, return users choice (if specified), else use the default
  return {
    pageTitle: isThere(usersChoice.hideHeading)
      ? !usersChoice.hideHeading : visibleComponents.pageTitle,
    navigation: isThere(usersChoice.hideNav)
      ? !usersChoice.hideNav : visibleComponents.navigation,
    searchBar: isThere(usersChoice.hideSearch)
      ? !usersChoice.hideSearch : visibleComponents.searchBar,
    footer: isThere(usersChoice.hideFooter)
      ? !usersChoice.hideFooter : visibleComponents.footer,
  };
};

/**
 * Gets the users saved theme, first looks for local storage theme,
 * then looks at user's appConfig, and finally checks the defaults
 * @returns Name of theme to apply
 */
export const getTheme = (): string => {
  const localTheme = localStorage[localStorageKeys.THEME];
  const appConfigTheme = config.appConfig.theme;
  return localTheme || appConfigTheme || defaultTheme;
};

/**
 * Gets any custom styles the user has applied, wither from local storage, or from the config
 * @returns An array of objects, one for each theme, containing kvps for variables
 */
export const getCustomColors = (): Record<string, any> => {
  const localColors = JSON.parse(localStorage[localStorageKeys.CUSTOM_COLORS] || "{}");
  const configColors = config.appConfig.customColors || {};
  return Object.assign(configColors, localColors);
};

/**
 * Returns a list of items which the user has assigned a hotkey to
 * So that when the hotkey is pressed, the app/ service can be launched
 */
export const getCustomKeyShortcuts = () => {
  const results: { hotkey: string | number; url: string }[][] = [];
  const sections = config.sections || [];
  sections.forEach((section) => {
    const itemsWithHotKeys = section.items.filter((item: { hotkey: string | number }) => item.hotkey);
    results.push(itemsWithHotKeys.map((item: { hotkey: string | number; url: string }) => ({ hotkey: item.hotkey, url: item.url })));
  });
  return results.flat();
};

/**
 * Gets the users chosen language. Defaults to English.
 * @returns Language, including code, name and flag
 */
export const getUsersLanguage = (): Language | undefined => {
  const langCode = localStorage[localStorageKeys.LANGUAGE]
    || config.appConfig.language
    || defaultLanguage;
  const langObj = languages.find(lang => lang.code === langCode);
  return langObj;
};

type TargetSchema = {
  properties: {
    sections: {
      items: {
        properties: {
          items: {
            items: {
              properties: {
                target: { enum: string[] };
              };
            };
          };
        };
      };
    };
  };
};

/**
 * validator for item target attribute
 * Uses enum values from config schema, and shows warning if invalid
 * @param target
 * @returns isValid
 */
export const targetValidator = (target: string): boolean => {
  const schema = ConfigSchema as TargetSchema;
  const acceptedTargets = schema.properties.sections.items.properties.items.items.properties.target.enum;
  const isTargetValid = acceptedTargets.indexOf(target) !== -1;
  if (!isTargetValid) ErrorHandler(`Unknown target value: ${target}`);
  return isTargetValid;
};
