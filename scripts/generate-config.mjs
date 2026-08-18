#!/usr/bin/env node
/**
 * Generate the config files for moshi.
 *
 * Without arguments, copies the default templates from src/template/ into
 * src/config/ so the app has a valid conf.yml on first run, without shipping
 * user-specific data.
 *
 * With page name argument(s), copies the conf.yml template to a sub-page
 * config: `node scripts/generate-config.mjs exp` writes src/config/conf-exp.yml
 * (matching the conf-<name>.yml route convention).
 *
 * Sub-pages are auto-discovered at build time: dropping src/config/conf-<name>.yml
 * is enough - the route and the nav entry appear after the next rebuild.
 *
 * Usage:
 *   node scripts/generate-config.mjs                  # write missing configs only
 *   node scripts/generate-config.mjs --force          # overwrite existing files
 *   node scripts/generate-config.mjs --only conf.yml
 *   node scripts/generate-config.mjs --dry-run        # show what would be written
 *   node scripts/generate-config.mjs exp              # write src/config/conf-exp.yml
 *   node scripts/generate-config.mjs exp dev          # write conf-exp.yml and conf-dev.yml
 *   node scripts/generate-config.mjs --dry-run exp    # show the would-be page file
 *
 * Exit code is 0 on success, 1 when a template is missing, a page name is
 * invalid, or a file could not be written.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATE_DIR = path.resolve(__dirname, '..', 'src', 'template');
const CONFIG_DIR = path.resolve(__dirname, '..', 'src', 'config');

/* Default templates: filename -> copy to src/config/<filename> */
const TEMPLATES = ['conf.yml'];

/* Mirror makePageName from src/utils/ConfigHelpers.ts */
const sanitizePageName = (rawName) =>
  rawName
    .toLowerCase()
    .replace(/\.ya?ml$/, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s-]+/g, '');

/* Personalise a new sub-page copy: set its nav title and a default weight so
 * build-time discovery shows it in the menu with a sensible order. */
const customizePageContent = (content, pageName) =>
  content
    .replace('title: moshi', `title: ${pageName}`)
    .replace(
      '# Page meta info, like heading, footer text and nav links',
      '# 排序权重(可选):数字越小,在主页菜单中越靠前\nweight: 100\n\n# Page meta info, like heading, footer text and nav links',
    );

/* Parse simple CLI flags */
const args = process.argv.slice(2);
const force = args.includes('--force');
const dryRun = args.includes('--dry-run');
const onlyFlag = args.indexOf('--only');
const only = onlyFlag !== -1 && args[onlyFlag + 1] ? args[onlyFlag + 1] : null;

/* Positional page names: anything that isn't a flag or the --only value */
const pageNames = args.filter((arg, index) => {
  if (arg === '--force' || arg === '--dry-run' || arg === '--only') return false;
  return only === null || index !== onlyFlag + 1;
});

/* Build (templateFile, targetFile) pairs for every requested config */
const buildTargets = () => {
  if (pageNames.length > 0) {
    return pageNames.map((rawName) => {
      const name = sanitizePageName(rawName);
      if (!name) {
        console.error(`[generate-config] Invalid page name: ${rawName}`);
        process.exit(1);
      }
      return {
        name: `conf-${name}.yml`,
        templateFile: path.join(TEMPLATE_DIR, 'conf.yml'),
        targetFile: path.join(CONFIG_DIR, `conf-${name}.yml`),
      };
    });
  }

  const names = only ? TEMPLATES.filter((t) => t === only) : TEMPLATES;

  if (names.length === 0) {
    console.error(`Unknown template name: ${only}`);
    console.error(`Available templates: ${TEMPLATES.join(', ')}`);
    process.exit(1);
  }

  return names.map((name) => ({
    name,
    templateFile: path.join(TEMPLATE_DIR, name),
    targetFile: path.join(CONFIG_DIR, name),
  }));
};

const targets = buildTargets();

let failed = false;

for (const { name, templateFile, targetFile } of targets) {
  if (!fs.existsSync(templateFile)) {
    console.error(`[generate-config] Template not found: ${templateFile}`);
    failed = true;
    continue;
  }

  if (fs.existsSync(targetFile) && !force) {
    console.log(`[generate-config] Skipped ${name} (already exists, use --force to overwrite)`);
    continue;
  }

  let content = fs.readFileSync(templateFile, 'utf-8');
  const isPageTarget = name.startsWith('conf-') && name !== 'conf.yml';
  if (isPageTarget) {
    content = customizePageContent(content, name.slice(5, -4));
  }

  if (dryRun) {
    console.log(`[generate-config] (dry-run) Would write ${targetFile}`);
    continue;
  }

  try {
    fs.writeFileSync(targetFile, content, 'utf-8');
    console.log(`[generate-config] Wrote ${targetFile}`);
  } catch (err) {
    console.error(`[generate-config] Failed to write ${targetFile}: ${err.message}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
