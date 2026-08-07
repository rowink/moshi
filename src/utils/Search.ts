/* Dashy: Licensed under MIT, (C) Alicia Sykes 2021 <https://aliciasykes.com> */

/* Tile filtering utility */
import ErrorHandler from '@/utils/ErrorHandler';
import type { Item } from '@/types';

/**
 * Extracts the site name from domain
 * @param url The URL to process
 * @returns The hostname from URL
 */
const getDomainFromUrl = (url?: string): string => {
  if (!url) return '';
  const urlPattern = /^(?:https?:\/\/)?(?:w{3}\.)?([a-z\d.-]+)\.(?:[a-z.]{2,10})(?:[/\w.-]*)*/;
  const domainPattern = urlPattern.exec(url);
  return domainPattern ? domainPattern[1] : '';
};

/**
 * Compares search term to a given data attribute
 * Ignores case, special characters and order
 * @param compareStr The value to compare to
 * @param searchStr The users search term
 * @returns true if a match, otherwise false
 */
const filterHelper = (compareStr: unknown, searchStr: string): boolean => {
  if (!compareStr) return false;
  const process = (input: unknown) => (input ? input.toString().toLowerCase().replace(/[^\w\s]/gi, '') : '');
  return process(searchStr).split(/\s/).every(word => process(compareStr).includes(word));
};

/**
 * Filter tiles based on users search term, and returns a filtered list
 * Will match based on title, description, provider, hostname from url and tags
 * Ignores case, special characters and other irrelevant things
 * @param allTiles An array of tiles
 * @param searchTerm The users search term
 * @returns A filtered array of tiles
 */
export const searchTiles = (allTiles: Item[], searchTerm: string): Item[] => {
  if (!searchTerm) return allTiles; // If no search term, then return all
  if (!allTiles) return []; // If no data, then skip
  return allTiles.filter((tile) => {
    const {
      title, description, provider, url, tags,
    } = tile;
    return filterHelper(title, searchTerm)
      || filterHelper(provider, searchTerm)
      || filterHelper(description, searchTerm)
      || filterHelper(tags, searchTerm)
      || filterHelper(getDomainFromUrl(url), searchTerm);
  });
};

/* From a list of search bangs, return the URL associated with it */
export const getSearchEngineFromBang = (searchQuery: string, bangList: Record<string, string>): string | undefined => {
  const bangNames = Object.keys(bangList);
  const foundBang = bangNames.find((bang) => searchQuery.includes(bang));
  return foundBang ? bangList[foundBang] : undefined;
};

/* For a given search engine key, return the corresponding URL, or throw error */
export const findUrlForSearchEngine = (
  searchEngine: string,
  availableSearchEngines: Record<string, string>,
): string | undefined => {
  // If missing search engine, report error return false
  if (!searchEngine) { ErrorHandler('No search engine specified'); return undefined; }
  // If search engine is already a URL, then return it
  if ((/(http|https):\/\/[^]*/).test(searchEngine)) return searchEngine;
  // If search engine was found successfully, return the URL
  if (availableSearchEngines[searchEngine]) return availableSearchEngines[searchEngine];
  // Otherwise, there's been an error, log it and return false
  ErrorHandler(`Specified Search Engine was not Found: '${searchEngine}'`);
  return undefined;
};

/* Removes all known bangs from a search query */
export const stripBangs = (searchQuery: string, bangList?: Record<string, string>): string => {
  const bangNames = Object.keys(bangList || {});
  let q = searchQuery;
  bangNames.forEach((bang) => { q = q.replace(bang, ''); });
  return q.trim();
};
