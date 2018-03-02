/**
 * Default configuration values. These are deeply merged with any user-supplied values from
 * `app-config.js`.
 * @typedef {Object} UenoConfig
 */
module.exports = {
  /**
   * Config values available to the server only. Store sensitive things here that shouldn't be
   * visible to the client.
   * @type Object
   */
  serverRuntimeConfig: {
    // Pass Helmet attributes to HTML
    helmet: {
      htmlAttributes: {
        lang: 'en',
      },
      title: 'Home',
      titleTemplate: 'Ueno - %s',
      meta: [
        { 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' },
      ],
    },
    // Enable password protection for all pages
    passwordProtect: process.env.PASSWORD_PROTECT,
    // Enable polyfill.io (set to `null` to disable)
    polyfillIO: {
      // Script to fetch
      url: '//cdn.polyfill.io/v2/polyfill.min.js',
      // Features to polyfill
      features: [
        'default',
        'es6',
      ],
    },
    // Unique project ID (used for realm in basic auth)
    projectId: 'ueno',
    // Enable offline support via service worker
    serverWorker: false,
    // Enable Facebook tracking
    facebookPixel: null,
    // Enable Twitter tracking
    twitterPixel: null,
    // Enable loading resources from Google Fonts
    googleFonts: true,
    // Add to default Content Security Policy
    csp: {},
  },
  /**
   * Config values available to the server and the client. Store values here that are permissable
   * to be revealed to the client.
   * @type Object
   */
  publicRuntimeConfig: {
    // @TODO Enable Heroku dev tools
    herokuDevtools: false,
    // Redirect HTTP requests to HTTPS
    enforceHttps: false,
    // Enable Google Analytics tracking
    gaId: '',
    // @TODO Show OS notifications
    notifier: 'warn',
  },
};
