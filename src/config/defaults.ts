const defaults = {
  /* Default pageInfo object, used if user does not specify their own */
  pageInfo: {
    title: "moshi",
    description: "",
    navLinks: [],
    footerText: "",
  },
  /* Default appConfig to be used, if user does not specify their own */
  appConfig: {} as Record<string, any>,
  /* Default language code */
  language: "en",
  /* The page to use as the starting homepage */
  startingView: "default",
  /* Default icon size to be applied on initial load */
  iconSize: "medium",
  /* Default layout to be applied on initial load */
  layout: "auto",
  /* Default theme to be applied on initial load */
  theme: "default",
  /* Default Font-Awesome API key, for FA icons (if used) */
  fontAwesomeKey: "0821c65656",
  /* Default API to use for fetching of user service favicon icons (if enabled) */
  faviconApi: "allesedv",
  /* The default sort order for sections */
  sortOrder: "default",
  /* If no 'target' specified, this is the default opening method */
  openingMethod: "newtab",
  /* The page paths for each route within the app for the router */
  routePaths: {
    home: "/home",
    about: "/about",
    notFound: "/404",
  },
  /* Server Endpoints */
  serviceEndpoints: {
    statusCheck: "/status-check",
  },
  /* List of built-in themes, to be displayed within the theme-switcher dropdown */
  builtInThemes: [
    "default",
    "callisto",
    "material",
    "material-dark",
    "docs",
    "colorful",
    "dracula",
    "one-dark",
    "lissy",
    "cherry-blossom",
    "nord-frost",
    "nord",
    "argon",
    "fallout",
    "whimsy",
    "oblivion",
    "adventure",
    "crayola",
    "deep-ocean",
    "minimal-dark",
    "minimal-light",
    "thebe",
    "matrix",
    "matrix-red",
    "color-block",
    "raspberry-jam",
    "bee",
    "tiger",
    "glow",
    "vaporware",
    "cyberpunk",
    "material-original",
    "material-dark-original",
    "high-contrast-dark",
    "high-contrast-light",
    "adventure-basic",
    "basic",
  ],
  /* Which CSS variables to show in the first view of theme configurator */
  mainCssVars: ["primary", "background", "background-darker"],
  /* Which structural components should be visible by default */
  visibleComponents: {
    splashScreen: false,
    navigation: true,
    pageTitle: true,
    searchBar: true,
    footer: true,
  },
  /* A list of route names that page furniture (header, footer, etc) should be hidden on */
  hideFurnitureOn: [],
  /* Key names for local storage identifiers */
  localStorageKeys: {
    LANGUAGE: "language",
    HIDE_WELCOME_BANNER: "hideWelcomeHelpers",
    LAYOUT_ORIENTATION: "layoutOrientation",
    COLLAPSE_STATE: "collapseState",
    ICON_SIZE: "iconSize",
    THEME: "theme",
    PRIMARY_THEME: "primaryTheme",
    CUSTOM_COLORS: "customColors",
    CONF_SECTIONS: "confSections",
    PAGE_INFO: "pageInfo",
    APP_CONFIG: "appConfig",
    MOST_USED: "mostUsed",
    LAST_USED: "lastUsed",
  },
  /* Key names for session storage identifiers */
  sessionStorageKeys: {
    SW_STATUS: "serviceWorkerStatus",
    ERROR_LOG: "errorLog",
  },
  /* Page meta-data, rendered in the header of each view */
  metaTagData: [{ name: "description", content: "A simple static homepage for you're server" }],
  /* Default option for Toast messages */
  toastedOptions: {
    position: "bottom-center",
    duration: 2500,
    keepOnHover: true,
    className: "toast-message",
    iconPack: "fontawesome",
  },
  /* Default tooltip options */
  tooltipOptions: {
    defaultTrigger: "hover focus",
    defaultHideOnTargetClick: true,
    autoHide: true,
    defaultHtml: false,
    defaultPlacement: "auto",
    defaultLoadingContent: "Loading...",
    defaultDelay: { show: 380, hide: 0 },
    // delay: { show: 380, hide: 0 },
  },
  /* Available services for fetching favicon icon for user apps */
  faviconApiEndpoints: {
    allesedv: "https://f1.allesedv.com/128/$URL",
    clearbit: "https://logo.clearbit.com/$URL",
    iconhorse: "https://icon.horse/icon/$URL",
    faviconkit: "https://api.faviconkit.com/$URL/64",
    duckduckgo: "https://icons.duckduckgo.com/ip2/$URL.ico",
    yandex: "https://favicon.yandex.net/favicon/$URL",
    google: "https://www.google.com/s2/favicons?sz=128&domain_url=$URL",
    besticon: "https://besticon-demo.herokuapp.com/icon?url=$URL&size=80..120..200",
    webmasterapi: "https://api.webmasterapi.com/v1/favicon/yEwx0ZFs0CSPshHq/$URL",
    mcapi: "https://eu.mc-api.net/v3/server/favicon/$URL",
  },
  /* The URL to CDNs used for external icons. These are only loaded when required */
  iconCdns: {
    fa: "https://kit.fontawesome.com",
    mdi: "https://cdn.jsdelivr.net/npm/@mdi/font@7.0.96/css/materialdesignicons.min.css",
    generative: "https://avatars.dicebear.com/api/identicon/{icon}.svg",
    generativeFallback: "https://evatar.io/{icon}",
    localPath: "./item-icons",
    faviconName: "favicon.ico",
    homeLabIcons:
      "https://raw.githubusercontent.com/walkxcode/dashboard-icons/master/png/{icon}.png",
    homeLabIconsFallback:
      "https://raw.githubusercontent.com/NX211/homer-icons/master/png/{icon}.png",
  },
  /* URLs for web search engines */
  searchEngineUrls: {
    // Common
    duckduckgo: "https://duckduckgo.com/?q=",
    google: "https://google.com/search?q=",
    whoogle: "https://whoogle.sdf.org/search?q=",
    qwant: "https://www.qwant.com/?q=",
    startpage: "https://www.startpage.com/do/search?query=",
    // Niche
    "searx-bar": "https://searx.bar/search?q=",
    "searx-info": "https://searx.info/search?q=",
    "searx-tiekoetter": "https://searx.tiekoetter.com/search?q=",
    "searx-bissisoft": "https://searx.bissisoft.com/search?q=",
    ecosia: "https://www.ecosia.org/search?q=",
    metager: "https://metager.org/meta/meta.ger3?eingabe=",
    swisscows: "https://swisscows.com/web?query=",
    mojeek: "https://www.mojeek.com/search?q=",
    peekier: "https://peekier.com/#!",
    // Specific
    wikipedia: "https://en.wikipedia.org/w/?search=",
    stackoverflow: "https://stackoverflow.com/search?q=",
    wolframalpha: "https://www.wolframalpha.com/input/?i=",
    reddit: "https://www.reddit.com/search/?q=",
    youtube: "https://youtube.com/results?q=",
    github: "https://github.com/search?q=",
    bbc: "https://www.bbc.co.uk/search?q=",
  },
  defaultSearchEngine: "duckduckgo",
  defaultSearchOpeningMethod: "newtab",
  searchBangs: {
    "/b": "bbc",
    "/d": "duckduckgo",
    "/g": "google",
    "/r": "reddit",
    "/w": "wikipedia",
    "/y": "youtube",
    "/gh": "github",
    "/so": "stackoverflow",
    "/wa": "wolframalpha",
  },
  /* Use your own self-hosted Sentry instance. Only used if error reporting is turned on */
  sentryDsn: "https://3138ea85f15a4fa883a5b27a4dc8ee28@o937511.ingest.sentry.io/5887934",
  /* Progressive Web App settings, used by Vue Config */
  pwa: {
    name: "moshi",
    manifestPath: "./manifest.json",
    themeColor: "#00af87",
    msTileColor: "#0b1021",
    mode: "production",
  },
};

export default defaults;
export const {
  pageInfo, appConfig, language, startingView, iconSize, layout,
  theme, fontAwesomeKey, faviconApi, sortOrder, openingMethod, routePaths,
  serviceEndpoints, builtInThemes, mainCssVars, visibleComponents,
  hideFurnitureOn, localStorageKeys, sessionStorageKeys,
  metaTagData, toastedOptions, tooltipOptions,
  faviconApiEndpoints, iconCdns,
  searchEngineUrls, defaultSearchEngine, defaultSearchOpeningMethod, searchBangs,
  sentryDsn, pwa,
} = defaults;
