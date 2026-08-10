/**
 * Composable version of the HomeMixin, for all homepages
 * (default home, minimal home, workspace, etc)
 */
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Defaults, { localStorageKeys, iconCdns } from "@/config/defaults";
import { searchTiles } from "@/utils/Search";
import {
  GetTheme,
  ApplyLocalTheme,
  ApplyCustomVariables,
} from "@/utils/ThemeHelper";
import { useAppStore } from "@/store/modules/appStore";
import { Item, Section } from "@/types/types";

interface SubPageInfo {
  pageId?: string;
  confPath?: string;
}

export const useHome = (subPageInfo?: SubPageInfo) => {
  const appStore = useAppStore();
  const route = useRoute();

  const sections = computed(() => appStore.sections);
  const appConfig = computed(() => appStore.appConfig);
  const pageInfo = computed(() => appStore.pageInfo);
  const modalOpen = computed(() => appStore.modalOpen);
  const pageId = computed(() => (subPageInfo && subPageInfo.pageId ? subPageInfo.pageId : "home"));

  const searchValue = ref("");

  const getConfigForRoute = async () => {
    appStore.setCurrentSubPage(subPageInfo);
    const confPath = subPageInfo && subPageInfo.confPath;
    if (confPath) {
      // Get config for sub-page
      await appStore.initializeMultiPageConfig(confPath);
    } else {
      // Otherwise, use main config
      appStore.useMainConfig();
    }
  };

  /* TEMPORARY: If on sub-page, check if custom theme is set and return it */
  const getSubPageTheme = (): string | null => {
    if (!pageId.value || pageId.value === "home") {
      return null;
    } else {
      const themeStoreKey = `${localStorageKeys.THEME}-${pageId.value}`;
      return localStorage[themeStoreKey] || null;
    }
  };

  const setTheme = () => {
    const theme = getSubPageTheme() || GetTheme();
    ApplyLocalTheme(theme);
    ApplyCustomVariables(theme);
  };

  const updateModalVisibility = (modalState: boolean) => {
    appStore.setModalOpen(modalState);
  };

  /* Updates local data with search value, triggered from filter comp */
  const searching = (searchTerm: string) => {
    searchValue.value = searchTerm || "";
  };

  /* Returns true if there is one or more sections in the config */
  const checkTheresData = (allSections: Section[] | undefined) => {
    const localSections = localStorage[localStorageKeys.CONF_SECTIONS];
    return (
      (allSections && allSections.length >= 1) ||
      (localSections && localSections.length >= 1)
    );
  };

  /* Returns only the tiles that match the users search query */
  const filterTiles = (allTiles: Item[] | undefined, _searchTerm?: string): Item[] => {
    if (!allTiles) {
      return [];
    }
    return searchTiles(allTiles, searchValue.value);
  };

  /* Checks if any sections or items use icons from a given CDN */
  const checkIfIconLibraryNeeded = (prefix: string): boolean => {
    if (!sections.value) return false;
    let isNeeded = false; // Will be set to true if prefix found in icon name
    sections.value.forEach((section: Section) => {
      if (section && section.icon && section.icon.includes(prefix))
        isNeeded = true;
      if (section && section.items) {
        section.items.forEach((item: Item) => {
          if (item.icon && item.icon.includes(prefix)) isNeeded = true;
        });
      }
    });
    return isNeeded;
  };

  /* Checks if any of the icons are Font Awesome glyphs */
  const checkIfFontAwesomeNeeded = () => {
    if (appConfig.value.enableFontAwesome === false) return false;
    if (appConfig.value.enableFontAwesome) return true;
    let isNeeded = checkIfIconLibraryNeeded("fa-");
    const currentTheme = localStorage[localStorageKeys.THEME]; // Some themes require FA
    if (["material", "material-dark"].includes(currentTheme)) isNeeded = true;
    return isNeeded;
  };

  /* Injects font-awesome's script tag, only if needed */
  const initiateFontAwesome = () => {
    if (checkIfFontAwesomeNeeded()) {
      const fontAwesomeScript = document.createElement("script");
      const faKey = appConfig.value.fontAwesomeKey || Defaults.fontAwesomeKey;
      fontAwesomeScript.setAttribute("src", `${iconCdns.fa}/${faKey}.js`);
      document.head.appendChild(fontAwesomeScript);
    }
  };

  /* Checks if any of the icons are Material Design Icons */
  const checkIfMdiNeeded = () => {
    const userOverride = appConfig.value.enableMaterialDesignIcons;
    if (userOverride === false) return false;
    return userOverride || checkIfIconLibraryNeeded("mdi-");
  };

  /* Injects Material Design Icons, only if needed */
  const initiateMaterialDesignIcons = () => {
    if (checkIfMdiNeeded()) {
      const mdiStylesheet = document.createElement("link");
      mdiStylesheet.setAttribute("rel", "stylesheet");
      mdiStylesheet.setAttribute("href", iconCdns.mdi);
      document.head.appendChild(mdiStylesheet);
    }
  };

  /* Returns true if there is more than 1 sub-result visible during searching */
  const checkIfResults = () => {
    if (!sections.value) return false;
    else {
      let itemsFound = true;
      sections.value.forEach((section: Section) => {
        if (filterTiles(section.items, searchValue.value).length > 0)
          itemsFound = false;
      });
      return itemsFound;
    }
  };

  /* If user has a background image, then generate CSS attributes */
  const getBackgroundImage = () => {
    if (appConfig.value && appConfig.value.backgroundImg) {
      return `background: url('${appConfig.value.backgroundImg}') no-repeat center fixed;background-size:cover;`;
    }
    return "";
  };

  /* Extracts the site name from domain, used for the searching functionality */
  const getDomainFromUrl = (url: string) => {
    if (!url) return "";
    const urlPattern =
      /^(?:https?:\/\/)?(?:w{3}\.)?([a-z\d.-]+)\.(?:[a-z.]{2,10})(?:[/\w.-]*)*/;
    const domainPattern = url.match(urlPattern);
    return domainPattern ? domainPattern[1] : "";
  };

  /* Load config and theme on mount, and whenever the route changes */
  onMounted(async () => {
    await getConfigForRoute();
    setTheme();
  });

  watch(
    () => route.fullPath,
    async () => {
      await getConfigForRoute();
      setTheme();
    },
  );

  return {
    appStore,
    sections,
    appConfig,
    pageInfo,
    modalOpen,
    pageId,
    searchValue,
    getConfigForRoute,
    getSubPageTheme,
    setTheme,
    updateModalVisibility,
    searching,
    checkTheresData,
    filterTiles,
    checkIfIconLibraryNeeded,
    checkIfFontAwesomeNeeded,
    initiateFontAwesome,
    checkIfMdiNeeded,
    initiateMaterialDesignIcons,
    checkIfResults,
    getBackgroundImage,
    getDomainFromUrl,
  };
};

export default useHome;
