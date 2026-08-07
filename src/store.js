/* eslint-disable no-param-reassign, prefer-destructuring */
import { defineStore } from 'pinia';
import axios from 'axios';
import yaml from 'js-yaml';
import ConfigAccumulator from '@/utils/ConfigAccumalator';
import { componentVisibility } from '@/utils/ConfigHelpers';
import ErrorHandler, { InfoHandler, InfoKeys } from '@/utils/ErrorHandler';
import { localStorageKeys } from './utils/defaults';

export const useAppStore = defineStore('app', {
  state: () => ({
    config: {}, // The current config, rendered to the UI
    remoteConfig: {}, // The configuration stored on the server
    modalOpen: false, // KB shortcut functionality will be disabled when modal is open
    currentConfigInfo: undefined, // For multi-page support, will store info about config file
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
    webSearch() {
      return this.appConfig.webSearch || {};
    },
    visibleComponents() {
      return componentVisibility(this.appConfig);
    },
    getSectionByIndex() {
      return (index) => this.sections[index];
    },
    getItemById() {
      return (id) => {
        let item;
        this.sections.forEach(sec => {
          if (sec.items) {
            const foundItem = sec.items.find((itm) => itm.id === id);
            if (foundItem) item = foundItem;
          }
        });
        return item;
      };
    },
    getParentSectionOfItem() {
      return (itemId) => {
        let foundSection;
        this.sections.forEach((section) => {
          (section.items || []).forEach((item) => {
            if (item.id === itemId) foundSection = section;
          });
        });
        return foundSection;
      };
    },
    layout(state) {
      return state.config.appConfig.layout || 'auto';
    },
    iconSize(state) {
      return state.config.appConfig.iconSize || 'medium';
    },
  },
  actions: {
    /* Called when app first loaded. Reads config and sets state */
    async initializeConfig() {
      // Get the config file from the server and store it for use by the accumulator
      this.setRemoteConfig(yaml.load((await axios.get('/conf.yml')).data));
      const deepCopy = (json) => JSON.parse(JSON.stringify(json));
      const config = deepCopy(new ConfigAccumulator().config());
      this.setConfig(config);
    },
    /* Fetch config for a sub-page (sections and pageInfo only) */
    async initializeMultiPageConfig(configPath) {
      axios.get(configPath).then((response) => {
        const subConfig = yaml.load(response.data);
        const pageTheme = subConfig.appConfig?.theme;
        subConfig.appConfig = this.config.appConfig; // Always use parent appConfig
        if (pageTheme) subConfig.appConfig.theme = pageTheme; // Apply page theme override
        this.setConfig(subConfig);
      }).catch((err) => {
        ErrorHandler(`Unable to load config from '${configPath}'`, err);
      });
    },
    setConfig(config) {
      if (!config.appConfig) config.appConfig = {};
      this.config = config;
    },
    setRemoteConfig(config) {
      const notNullConfig = config || {};
      if (!notNullConfig.appConfig) notNullConfig.appConfig = {};
      this.remoteConfig = notNullConfig;
    },
    setLanguage(lang) {
      const newConfig = this.config;
      newConfig.appConfig.language = lang;
      this.config = newConfig;
    },
    setModalOpen(modalOpen) {
      this.modalOpen = modalOpen;
    },
    setItemLayout(layout) {
      this.config.appConfig.layout = layout;
      InfoHandler('Layout updated', InfoKeys.VISUAL);
    },
    setItemSize(iconSize) {
      this.config.appConfig.iconSize = iconSize;
      InfoHandler('Item size updated', InfoKeys.VISUAL);
    },
    setCurrentSubPage(subPageObject) {
      if (!subPageObject) {
        // Set theme back to primary when navigating to index page
        const defaulTheme = localStorage.getItem(localStorageKeys.PRIMARY_THEME);
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
