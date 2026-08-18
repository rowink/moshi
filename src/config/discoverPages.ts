/**
 * Build-time discovery of sub-page config files.
 *
 * Every conf-*.yml or *-conf.yml dropped into src/config/ becomes a sub-page
 * automatically:
 *   - route  : conf-<name>.yml -> "/<name>" and <name>-conf.yml -> "/<name>"
 *   - menu   : labelled with the file's pageInfo.title
 *   - order  : sorted by the optional top-level `weight` field (ascending,
 *              unweighted pages last), ties broken by title
 *
 * Dropping a new config file into src/config/ and rebuilding is all it takes
 * to add a page - no manual `pages` entry in conf.yml required.
 */
import yaml from "js-yaml";
import { makePageId } from "@/utils/ConfigHelpers";

export interface DiscoveredPage {
  /* Nav label, from the file's pageInfo.title (falls back to the filename) */
  name: string;
  /* Config file name, e.g. "doc-conf.yml" */
  path: string;
  /* Resolved route, e.g. "/doc" */
  route: string;
  /* Stable page id, used for per-page theme keys and route names */
  pageId: string;
  /* Nav sort weight, ascending; unweighted pages get DEFAULT_WEIGHT */
  weight: number;
  /* The full parsed config, bundled at build time for instant switching */
  config: Record<string, any>;
}

/* Pages without an explicit weight sort after all weighted ones */
const DEFAULT_WEIGHT = 999;

/* Inlined at build time: { "./doc-conf.yml": "<raw yaml>" } */
const rawFiles = import.meta.glob("./{conf-*,*-conf}.yml", {
  query: "?raw",
  import: "default",
  eager: true,
});

const fileNameOf = (filePath: string) => filePath.split("/").pop() || "";

/* Deterministic route from the file name: conf-exp.yml -> /exp,
 * doc-conf.yml -> /doc, conf.yml -> / */
const routeFromPath = (path: string): string => {
  const baseName = path.replace(/\.ya?ml$/i, "");
  if (baseName === "conf") return "/";
  if (baseName.startsWith("conf-")) return `/${baseName.slice(5)}`;
  if (baseName.endsWith("-conf")) return `/${baseName.slice(0, -5)}`;
  return `/${baseName}`;
};

const parseDiscoveredPage = (
  filePath: string,
  raw: string,
): DiscoveredPage | null => {
  const parsed = yaml.load(raw) as Record<string, any> | null;
  if (!parsed) return null;
  const path = fileNameOf(filePath);
  const name =
    (parsed.pageInfo && parsed.pageInfo.title) ||
    path.replace(/\.ya?ml$/i, "");
  return {
    name,
    path,
    route: routeFromPath(path),
    pageId: makePageId({ name, path }),
    weight: typeof parsed.weight === "number" ? parsed.weight : DEFAULT_WEIGHT,
    config: parsed,
  };
};

/* All discovered sub-pages, ordered by weight (ascending), then title */
export const discoveredPages: DiscoveredPage[] = Object.entries(rawFiles)
  .map(([filePath, raw]) => parseDiscoveredPage(filePath, raw as string))
  .filter((page): page is DiscoveredPage => page !== null)
  .sort((a, b) => a.weight - b.weight || a.name.localeCompare(b.name));
