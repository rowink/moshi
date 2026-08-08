/**
 * This is the router config, which defined the location for
 * each page within the app, and how they should be loaded
 * Note that the page paths are defined in @/utils/defaults.js
 */

// Import Vue.js and vue router
import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';
import { Progress } from 'rsup-progress';

// Import views, that are not lazy-loaded
import yaml from 'js-yaml';
import Home from '@/views/Home.vue';

// Import helper functions, config data and defaults
import { makePageSlug, makePageName } from '@/utils/ConfigHelpers';
import { metaTagData, startingView, routePaths } from '@/utils/defaults';
import ErrorHandler from '@/utils/ErrorHandler';

// Import data from users conf file. Note that rebuild is required for this to update.
import confRaw from '../../public/conf.yml?raw';

const conf = yaml.load(confRaw) as Record<string, any> | null;

if (!conf) {
  ErrorHandler('You\'ve not got any data in your config file yet.');
}

// Assign top-level config fields, check not null
const config = conf || {};
const pages = config.pages || [];
const pageInfo = config.pageInfo || {};
const appConfig = config.appConfig || {};

Vue.use(Router);
const progress = new Progress({ color: 'var(--progress-bar)' });

/* Get the users chosen starting view from app config, or return default */
const getStartingView = () => appConfig.startingView || startingView;

/**
 * Returns the component that should be rendered at the base path,
 * Defaults to Home, but the user can change this to Workspace of Minimal
 */
const getStartingComponent = () => {
  const usersPreference = getStartingView();
  switch (usersPreference) {
    case 'minimal': return () => import('../views/Minimal.vue');
    case 'workspace': return () => import('../views/Workspace.vue');
    default: return Home;
  }
};

/* Returns the meta tags for each route */
const makeMetaTags = (defaultTitle: string) => ({
  title: pageInfo.title || defaultTitle,
  metaTags: metaTagData,
});

const makeSubConfigPath = (rawPath: string) => {
  if (!rawPath) return '';
  if (rawPath.startsWith('/') || rawPath.startsWith('http')) return rawPath;
  else return `/${rawPath}`;
};

/* For each additional config file, create routes for home, minimal and workspace views */
const makeMultiPageRoutes = (userPages: Record<string, any>[]): RouteConfig[] => {
  // If no multi pages specified, or is not array, then return nothing
  if (!userPages || !Array.isArray(userPages)) return [];
  const multiPageRoutes: RouteConfig[] = [];
  // For each user page, create an additional route
  userPages.forEach((page) => {
    if (!page.name || !page.path) { // Sumin not right, show warning
      ErrorHandler('Additional pages must have both a `name` and `path`');
    }
    // Props to be passed to home mixin
    const subPageInfo = {
      subPageInfo: {
        confPath: makeSubConfigPath(page.path),
        pageId: makePageName(page.name),
        pageTitle: page.name,
      },
    };
    // Create route for default homepage
    multiPageRoutes.push({
      path: makePageSlug(page.name, 'home'),
      name: `${subPageInfo.subPageInfo.pageId}-home`,
      component: Home,
      props: subPageInfo,
    });
    // Create route for the workspace view
    multiPageRoutes.push({
      path: makePageSlug(page.name, 'workspace'),
      name: `${subPageInfo.subPageInfo.pageId}-workspace`,
      component: () => import('../views/Workspace.vue'),
      props: subPageInfo,
    });
    // Create route for the minimal view
    multiPageRoutes.push({
      path: makePageSlug(page.name, 'minimal'),
      name: `${subPageInfo.subPageInfo.pageId}-minimal`,
      component: () => import('../views/Minimal.vue'),
      props: subPageInfo,
    });
  });
  return multiPageRoutes;
};

/* Routing mode, can be either 'hash', 'history' or 'abstract' */
const mode = appConfig.routingMode || 'history';

/* List of all routes, props, components and metadata */
const router = new Router({
  mode,
  routes: [
    ...makeMultiPageRoutes(pages),
    { // The default view can be customized by the user
      path: '/',
      name: `landing-page-${getStartingView()}`,
      component: getStartingComponent(),
      meta: makeMetaTags('Home Page'),
    },
    { // Default home page
      path: routePaths.home,
      name: 'home',
      component: Home,
      meta: makeMetaTags('Home Page'),
    },
    { // View only single section
      path: `${routePaths.home}/:section`,
      name: 'home-section',
      component: Home,
      meta: makeMetaTags('Home Page'),
    },
    { // Workspace view page
      path: routePaths.workspace,
      name: 'workspace',
      component: () => import('../views/Workspace.vue'),
      meta: makeMetaTags('Workspace'),
    },
    { // Minimal view page
      path: routePaths.minimal,
      name: 'minimal',
      component: () => import('../views/Minimal.vue'),
      meta: makeMetaTags('Start Page'),
    },
    { // The about app page
      path: routePaths.about,
      name: 'about', // We lazy load the About page so as to not slow down the app
      component: () => import('../views/About.vue'),
      meta: makeMetaTags('About moshi'),
    },
    { // Page not found, any non-defined routes will land here
      path: routePaths.notFound,
      name: '404',
      component: () => import('../views/404.vue'),
      meta: makeMetaTags('404 Not Found'),
      beforeEnter: (to, from, next) => {
        if (to.redirectedFrom) { // Log error, if redirected here from another route
          ErrorHandler(`Route not found: '${to.redirectedFrom}'`);
        }
        next();
      },
    },
    { // Redirect any not-found routed to the 404 view
      path: '*',
      redirect: '/404',
    },
  ],
});

router.beforeEach((to, from, next) => {
  progress.start();
  next();
});

/* If title is missing, then apply default page title */
router.afterEach((to) => {
  progress.end();
  Vue.nextTick(() => {
    document.title = to.meta?.title || 'moshi';
  });
});

// All done - export the now configured router
export default router;
