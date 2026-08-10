/* eslint-disable no-param-reassign, prefer-destructuring */
import { defineStore } from "pinia";
import axios from "axios";
import yaml from "js-yaml";
import ConfigAccumulator from "@/config/ConfigAccumalator";
import { componentVisibility } from "@/config/ConfigHelpers";
import ErrorHandler, { InfoHandler, InfoKeys } from "@/utils/ErrorHandler";
import { localStorageKeys } from "../../config/defaults";
import { Item, Section } from "@/types/types";

interface SubPageInfo {
  pageId?: string;
  confPath?: string;
}

export const useAppStore = defineStore("app", {
  state: () => ({
    config: {} as Record<string, any>, // The current config, rendered to the UI
    remoteConfig: {} as Record<string, any>, // The configuration stored on the server
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
    sections(state) {
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
    /* Fetch config for a sub-page (sections and pageInfo only) */
    async initializeMultiPageConfig(configPath: string) {
      axios
        .get(configPath)
        .then((response) => {
          const subConfig = yaml.load(response.data) as Record<string, any>;
          const pageTheme = subConfig.appConfig?.theme;
          subConfig.appConfig = this.config.appConfig; // Always use parent appConfig
          if (pageTheme) subConfig.appConfig.theme = pageTheme; // Apply page theme override
          this.setConfig(subConfig);
        })
        .catch((err: unknown) => {
          ErrorHandler(`Unable to load config from '${configPath}'`, err);
        });
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
        this.config = this.remoteConfig;
      } else {
        this.initializeConfig();
      }
    },
  },
});

export default useAppStore;
