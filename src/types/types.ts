/* Types aligned with the JSON schema in src/config/ConfigSchema.json. All fields optional, as the config is user-customizable. */

export type ItemTarget = "newtab" | "sametab" | "parent" | "top" | "modal" | "workspace" | "clipboard";
export type NavLinkTarget = "newtab" | "sametab" | "parent" | "top";
export type ItemSize = "small" | "medium" | "large";
export type SectionLayout = "grid" | "auto";
export type SortBy = "default" | "most-used" | "last-used" | "alphabetical" | "reverse-alphabetical" | "random";

export interface SubItem {
  title?: string;
  description?: string;
  icon?: string;
  url?: string;
  target?: ItemTarget;
  hotkey?: number;
  color?: string;
  [key: string]: any;
}

export interface Item {
  title?: string;
  description?: string;
  icon?: string;
  url?: string;
  displayData?: Record<string, any>;
  target?: ItemTarget;
  hotkey?: number;
  tags?: string[];
  provider?: string;
  statusCheck?: boolean;
  statusCheckUrl?: string;
  statusCheckHeaders?: Record<string, any>;
  statusCheckAllowInsecure?: boolean;
  statusCheckAcceptCodes?: string;
  statusCheckMaxRedirects?: number;
  color?: string;
  id?: string;
  subItems?: SubItem[];
}

export interface SectionDisplayData {
  sortBy?: SortBy;
  collapsed?: boolean;
  cutToHeight?: boolean;
  color?: string;
  customStyles?: string;
  itemSize?: ItemSize;
  rows?: number;
  cols?: number;
  sectionLayout?: SectionLayout;
  itemCountX?: number;
  itemCountY?: number;
}

export interface Section {
  name?: string;
  icon?: string;
  displayData?: SectionDisplayData;
  items?: Item[];
}

export interface NavLink {
  title?: string;
  path?: string;
  target?: NavLinkTarget;
}

export interface PageInfo {
  title?: string;
  description?: string;
  navLinks?: NavLink[];
  footerText?: string;
  logo?: string;
}

export interface WebSearchConfig {
  disableWebSearch?: boolean;
  searchEngine?: string;
  customSearchEngine?: string;
  openingMethod?: ItemTarget;
  searchBangs?: Record<string, string>;
}

export interface HideComponentsConfig {
  hideHeading?: boolean;
  hideNav?: boolean;
  hideSearch?: boolean;
  hideSettings?: boolean;
  hideFooter?: boolean;
}

export interface AppConfig {
  startingView?: string;
  defaultOpeningMethod?: ItemTarget;
  statusCheck?: boolean;
  statusCheckInterval?: number;
  language?: string;
  theme?: string;
  backgroundImg?: string;
  faviconApi?: string;
  defaultIcon?: string;
  layout?: string;
  iconSize?: ItemSize;
  colCount?: number;
  routingMode?: "hash" | "history";
  workspaceLandingUrl?: string;
  enableMultiTasking?: boolean;
  webSearch?: WebSearchConfig;
  enableFontAwesome?: boolean;
  enableMaterialDesignIcons?: boolean;
  fontAwesomeKey?: string;
  cssThemes?: string[];
  customColors?: Record<string, any>;
  externalStyleSheet?: string[];
  customCss?: string;
  hideComponents?: HideComponentsConfig;
  preventWriteToDisk?: boolean;
  preventLocalSave?: boolean;
  disableConfiguration?: boolean;
  disableConfigurationForNonAdmin?: boolean;
  allowConfigEdit?: boolean;
  enableServiceWorker?: boolean;
  disableContextMenu?: boolean;
  disableSmartSort?: boolean;
  enableErrorReporting?: boolean;
  sentryDsn?: string;
}

export interface Page {
  name?: string;
  path?: string;
}

export interface moshiConfig {
  pages?: Page[];
  pageInfo?: PageInfo;
  appConfig?: AppConfig;
  sections?: Section[];
}
