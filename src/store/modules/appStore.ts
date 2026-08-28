/* eslint-disable no-param-reassign, prefer-destructuring */
import { defineStore } from "pinia";
import axios from "axios";
import yaml from "js-yaml";
import ConfigAccumulator from "@/utils/ConfigAccumalator";
import { componentVisibility } from "@/utils/ConfigHelpers";
import { discoveredPages } from "@/utils/discoverPages";
import ErrorHandler, { InfoHandler, InfoKeys } from "@/utils/ErrorHandler";
import {
  localStorageKeys,
  iconSize as defaultIconSize,
  layout as defaultLayout,
} from "@/utils/defaults";
import { Item, Section } from "@/types/types";

/* Merge the user's locally-saved preferences (icon size, layout) into a
 * file-based appConfig, so they survive sub-page navigation. Mirrors the
 * behaviour of ConfigAccumulator.appConfig(). */
const applyLocalPreferences = (
  appConfig: Record<string, any>,
): Record<string, any> => {
  const merged = { ...appConfig };
  merged.layout =
    localStorage[localStorageKeys.LAYOUT_ORIENTATION] ||
    appConfig.layout ||
    defaultLayout;
  merged.iconSize =
    localStorage[localStorageKeys.ICON_SIZE] ||
    appConfig.iconSize ||
    defaultIconSize;
  return merged;
};

interface SubPageInfo {
  pageId?: string;
  confPath?: string;
}

export const useAppStore = defineStore("app", {
  state: () => ({
    config: {} as Record<string, any>, // The current config, rendered to the UI
    remoteConfig: {} as Record<string, any>, // The configuration stored on the server
    subPageConfigs: {} as Record<string, any>, // Cached raw sub-page configs, keyed by normalized config path
    modalOpen: false, // KB shortcut functionality will be disabled when modal is open
    currentConfigInfo: undefined as SubPageInfo | undefined, // For multi-page support, will store info about config file
  }),
  getters: {
    pageInfo(state) {
      if (!state.config) return {};
      return state.config.pageInfo || {};
    },
    appConfig(state) {
      if (!state.config) return {};
      return state.config.appConfig || {};
    },
    sections(state): Section[] {
      return state.config.sections || [];
    },
    pages(state) {
      return state.remoteConfig.pages || [];
    },
    theme(state) {
      let localTheme = null;
      if (state.currentConfigInfo?.pageId) {
        const themeStoreKey = `${localStorageKeys.THEME}-${state.currentConfigInfo?.pageId}`;
        localTheme = localStorage[themeStoreKey];
      } else {
        localTheme = localStorage[localStorageKeys.THEME];
      }
      return localTheme || state.config.appConfig.theme;
    },
    webSearch(state) {
      return state.config.appConfig?.webSearch || {};
    },
    visibleComponents(state) {
      return componentVisibility(state.config.appConfig || {});
    },
    getSectionByIndex() {
      return (index: number) => this.sections[index];
    },
    getItemById() {
      return (id: string): Item | undefined => {
        let item: Item | undefined;
        this.sections.forEach((sec: Section) => {
          if (sec.items) {
            const foundItem = sec.items.find((itm) => itm.id === id);
            if (foundItem) item = foundItem;
          }
        });
        return item;
      };
    },
    getParentSectionOfItem() {
      return (itemId: string): Section | undefined => {
        let foundSection: Section | undefined;
        this.sections.forEach((section: Section) => {
          (section.items || []).forEach((item) => {
            if (item.id === itemId) foundSection = section;
          });
        });
        return foundSection;
      };
    },
    layout(state) {
      return state.config.appConfig.layout || "auto";
    },
    iconSize(state) {
      return state.config.appConfig.iconSize || "medium";
    },
  },
  actions: {
    /* Called when app first loaded. Reads config and sets state */
    async initializeConfig() {
      // Get the config file from the server and store it for use by the accumulator
      this.setRemoteConfig(
        yaml.load((await axios.get("/conf.yml")).data) as Record<string, any>,
      );
      const deepCopy = (json: unknown) => JSON.parse(JSON.stringify(json));
      const config = deepCopy(new ConfigAccumulator().config());
      this.setConfig(config);
    },
    /* Fetch config for a sub-page (sections and pageInfo only).
     * Discovered sub-pages are bundled at build time, so switching to them
     * is instant; anything else falls back to a cached/live runtime fetch. */
    async initializeMultiPageConfig(configPath: string) {
      const discovered = discoveredPages.find(
        (page) => `/${page.path}` === configPath,
      );
      if (discovered) {
        this.applySubPageConfig(discovered.config);
        return;
      }
      const subConfig = await this.fetchSubPageConfig(configPath);
      if (subConfig) this.applySubPageConfig(subConfig);
    },
    /* Fetch a sub-page config, serving from cache when available. */
    async fetchSubPageConfig(
      configPath: string,
    ): Promise<Record<string, any> | null> {
      if (this.subPageConfigs[configPath])
        return this.subPageConfigs[configPath];
      try {
        const response = await axios.get(configPath);
        const subConfig = yaml.load(response.data) as Record<string, any>;
        this.subPageConfigs[configPath] = subConfig;
        return subConfig;
      } catch (err: unknown) {
        ErrorHandler(`Unable to load config from '${configPath}'`, err);
        return null;
      }
    },
    /* Apply a cached sub-config to the current view without mutating the cache. */
    applySubPageConfig(subConfig: Record<string, any>) {
      const parentAppConfig = this.remoteConfig.appConfig;
      const baseAppConfig = subConfig.appConfig || parentAppConfig;
      const merged = {
        ...subConfig,
        appConfig: applyLocalPreferences({ ...baseAppConfig }),
      };
      const pageTheme = subConfig.appConfig?.theme;
      if (pageTheme) merged.appConfig.theme = pageTheme; // Apply page theme override
      this.setConfig(merged);
    },
    /* Prefetch all sub-page configs in the background. */
    async prefetchSubPageConfigs() {
      const pages = (this.remoteConfig.pages || []) as Array<{ path?: string }>;
      const paths = pages
        .map((page) => page.path)
        .filter((path: string | undefined): path is string => !!path)
        .filter((path: string) => path !== "conf.yml")
        .map((path: string) =>
          path.startsWith("/") || path.startsWith("http") ? path : `/${path}`,
        );
      await Promise.allSettled(paths.map((p) => this.fetchSubPageConfig(p)));
    },
    setConfig(config: Record<string, any>) {
      if (!config.appConfig) config.appConfig = {};
      this.config = config;
    },
    setRemoteConfig(config: Record<string, any>) {
      const notNullConfig = config || {};
      if (!notNullConfig.appConfig) notNullConfig.appConfig = {};
      this.remoteConfig = notNullConfig;
    },
    setLanguage(lang: string) {
      const newConfig = this.config;
      newConfig.appConfig.language = lang;
      this.config = newConfig;
    },
    setModalOpen(modalOpen: boolean) {
      this.modalOpen = modalOpen;
    },
    setItemLayout(layout: string) {
      this.config.appConfig.layout = layout;
      InfoHandler("Layout updated", InfoKeys.VISUAL);
    },
    setItemSize(iconSize: string) {
      this.config.appConfig.iconSize = iconSize;
      InfoHandler("Item size updated", InfoKeys.VISUAL);
    },
    setCurrentSubPage(subPageObject: SubPageInfo | undefined) {
      if (!subPageObject) {
        // Set theme back to primary when navigating to index page
        const defaulTheme = localStorage.getItem(
          localStorageKeys.PRIMARY_THEME,
        );
        if (defaulTheme) this.config.appConfig.theme = defaulTheme;
      }
      this.currentConfigInfo = subPageObject;
    },
    useMainConfig() {
      if (this.remoteConfig) {
        this.config = {
          ...this.remoteConfig,
          appConfig: applyLocalPreferences({ ...this.remoteConfig.appConfig }),
        };
      } else {
        this.initializeConfig();
      }
    },
  },
});

export default useAppStore;
