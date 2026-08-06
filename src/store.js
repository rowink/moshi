/* eslint-disable no-param-reassign, prefer-destructuring */
import { defineStore } from 'pinia';
import axios from 'axios';
import yaml from 'js-yaml';
import ConfigAccumulator from '@/utils/ConfigAccumalator';
import { componentVisibility } from '@/utils/ConfigHelpers';
import { applyItemId } from '@/utils/SectionHelpers';
import filterUserSections from '@/utils/CheckSectionVisibility';
import ErrorHandler, { InfoHandler, InfoKeys } from '@/utils/ErrorHandler';
import { isUserAdmin } from '@/utils/Auth';
import { localStorageKeys } from './utils/defaults';

export const useAppStore = defineStore('app', {
  state: () => ({
    config: {}, // The current config, rendered to the UI
    remoteConfig: {}, // The configuration stored on the server
    editMode: false, // While true, the user can drag and edit items + sections
    modalOpen: false, // KB shortcut functionality will be disabled when modal is open
    currentConfigInfo: undefined, // For multi-page support, will store info about config file
    navigateConfToTab: undefined, // Used to switch active tab in config modal
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
      return filterUserSections(state.config.sections || []);
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
    /* Make config read/ write permissions object */
    permissions() {
      const appConfig = this.appConfig;
      const perms = {
        allowWriteToDisk: true,
        allowSaveLocally: true,
        allowViewConfig: true,
      };
      // Disable saving changes locally, only
      if (appConfig.preventLocalSave) {
        perms.allowSaveLocally = false;
      }
      // Disable saving changes to disk, only
      if (appConfig.preventWriteToDisk || !isUserAdmin()) {
        perms.allowWriteToDisk = false;
      }
      // Legacy Option: Will be removed in V 2.1.0
      if (appConfig.allowConfigEdit === false) {
        perms.allowWriteToDisk = false;
      }
      // Disable everything
      if (appConfig.disableConfiguration
        || (appConfig.disableConfigurationForNonAdmin && !isUserAdmin())) {
        perms.allowWriteToDisk = false;
        perms.allowSaveLocally = false;
        perms.allowViewConfig = false;
      }
      return perms;
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
    setEditMode(editMode) {
      if (editMode !== this.editMode) {
        InfoHandler(editMode ? 'Edit session started' : 'Edit session ended', InfoKeys.EDITOR);
        this.editMode = editMode;
      }
    },
    updateItem(payload) {
      const { itemId, newItem } = payload;
      const newConfig = { ...this.config };
      newConfig.sections.forEach((section, secIndex) => {
        (section.items || []).forEach((item, itemIndex) => {
          if (item.id === itemId) {
            newConfig.sections[secIndex].items[itemIndex] = newItem;
            InfoHandler('Item updated', InfoKeys.EDITOR);
          }
        });
      });
      this.config = newConfig;
    },
    setPageInfo(newPageInfo) {
      const newConfig = this.config;
      newConfig.pageInfo = newPageInfo;
      this.config = newConfig;
      InfoHandler('Page info updated', InfoKeys.EDITOR);
    },
    setAppConfig(newAppConfig) {
      const newConfig = this.config;
      newConfig.appConfig = newAppConfig;
      this.config = newConfig;
      InfoHandler('App config updated', InfoKeys.EDITOR);
    },
    setPages(multiPages) {
      const newConfig = this.config;
      newConfig.pages = multiPages;
      this.config = newConfig;
      InfoHandler('Pages updated', InfoKeys.EDITOR);
    },
    setSections(newSections) {
      const newConfig = this.config;
      newConfig.sections = newSections;
      this.config = newConfig;
      InfoHandler('Sections updated', InfoKeys.EDITOR);
    },
    updateSection(payload) {
      const { sectionIndex, sectionData } = payload;
      const newConfig = { ...this.config };
      newConfig.sections[sectionIndex] = sectionData;
      this.config = newConfig;
      InfoHandler('Section updated', InfoKeys.EDITOR);
    },
    insertSection(newSection) {
      const newConfig = { ...this.config };
      newSection.items = [];
      newConfig.sections.push(newSection);
      this.config = newConfig;
      InfoHandler('New section added', InfoKeys.EDITOR);
    },
    removeSection(payload) {
      const { sectionIndex, sectionName } = payload;
      const newConfig = { ...this.config };
      if (newConfig.sections[sectionIndex].name === sectionName) {
        newConfig.sections.splice(sectionIndex, 1);
        InfoHandler('Section removed', InfoKeys.EDITOR);
      }
      this.config = newConfig;
    },
    insertItem(payload) {
      const { newItem, targetSection } = payload;
      const config = { ...this.config };
      config.sections.forEach((section) => {
        if (section.name === targetSection) {
          if (!section.items) section.items = [];
          section.items.push(newItem);
          InfoHandler('New item added', InfoKeys.EDITOR);
        }
      });
      config.sections = applyItemId(config.sections);
      this.config = config;
    },
    copyItem(payload) {
      const { item, toSection, appendTo } = payload;
      const config = { ...this.config };
      const newItem = { ...item };
      config.sections.forEach((section) => {
        if (section.name === toSection) {
          if (!section.items) section.items = [];
          if (appendTo === 'beginning') {
            section.items.unshift(newItem);
          } else {
            section.items.push(newItem);
          }
          InfoHandler('Item copied', InfoKeys.EDITOR);
        }
      });
      config.sections = applyItemId(config.sections);
      this.config = config;
    },
    removeItem(payload) {
      const { itemId, sectionName } = payload;
      const config = { ...this.config };
      config.sections.forEach((section) => {
        if (section.name === sectionName && section.items) {
          section.items.forEach((item, index) => {
            if (item.id === itemId) {
              section.items.splice(index, 1);
              InfoHandler('Item removed', InfoKeys.EDITOR);
            }
          });
        }
      });
      config.sections = applyItemId(config.sections);
      this.config = config;
    },
    setTheme(themOps) {
      const { theme, pageId } = themOps;
      const newConfig = { ...this.config };
      newConfig.appConfig.theme = theme;
      this.config = newConfig;
      const themeStoreKey = pageId ? `${localStorageKeys.THEME}-${pageId}` : localStorageKeys.THEME;
      localStorage.setItem(themeStoreKey, theme);
      InfoHandler('Theme updated', InfoKeys.VISUAL);
    },
    setCustomColors(customColors) {
      const newConfig = { ...this.config };
      newConfig.appConfig.customColors = customColors;
      this.config = newConfig;
      InfoHandler('Color palette updated', InfoKeys.VISUAL);
    },
    setItemLayout(layout) {
      this.config.appConfig.layout = layout;
      InfoHandler('Layout updated', InfoKeys.VISUAL);
    },
    setItemSize(iconSize) {
      this.config.appConfig.iconSize = iconSize;
      InfoHandler('Item size updated', InfoKeys.VISUAL);
    },
    updateCustomCss(customCss) {
      this.config.appConfig.customCss = customCss;
      InfoHandler('Custom colors updated', InfoKeys.VISUAL);
    },
    setConfMenuIndex(index) {
      this.navigateConfToTab = index;
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
