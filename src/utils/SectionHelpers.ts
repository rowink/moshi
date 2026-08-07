/* Helper functions for Sections and Items */

import { hideFurnitureOn } from '@/utils/defaults';
import type { Section, Item } from '@/types';

/* Returns false if page furniture should be hidden on said route */
export const shouldBeVisible = (routeName?: string): boolean => {
  let shouldShow = true;
  if (!routeName) return shouldShow; // Route name not specified.
  hideFurnitureOn.forEach((hideOn) => {
    // If route name on the no-show list, set visibility to false
    if (routeName.includes(hideOn)) shouldShow = false;
  });
  return shouldShow;
};

/* Based on section title, item name and index, return a string value for ID */
const makeItemId = (sectionStr?: string, itemStr?: string, index?: number): string => {
  const sectionTitle = sectionStr || `unlabeledSec_${Math.random()}`;
  const charSum = sectionTitle.split('').map((a) => a.charCodeAt(0)).reduce((x, y) => x + y);
  const newItemStr = itemStr || `unknown_${Math.random()}`;
  const itemTitleStr = newItemStr.replace(/\s+/g, '-').replace(/[^a-zA-Z ]/g, '').toLowerCase();
  return `${index}_${charSum}_${itemTitleStr}`;
};

/* Given an array of sections, apply a unique ID to each item, and return modified array */
export const applyItemId = (inputSections: Section[]): Section[] => {
  const sections = inputSections || [];
  sections.forEach((sec, secIdx) => {
    if (sec.items) {
      sec.items.forEach((item, itemIdx) => {
        item.id = makeItemId(sec.name, item.title, itemIdx);
      });
    }
  });
  return sections;
};
