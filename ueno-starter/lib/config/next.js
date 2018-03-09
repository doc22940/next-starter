const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const withOffline = require('next-offline');
const compose = require('compose-function');
const deepAssign = require('deep-assign');
const pick = require('lodash/pick');
const defaultConfig = require('./defaults');

/**
 * Next.js plugin to apply a Sass loader, with PostCSS, CSS modules, and classnames.
 * @private
 * @param {Object} [nextConfig={}] - Next.js config to decorate.
 * @returns {Object} Modified Next.js config.
 */
const withSass = (nextConfig = {}) => Object.assign({}, nextConfig, {
  webpack: (config, options) => {
    const { dev, isServer } = options;

    // Plugin to create final CSS file in production
    const extractCSSPlugin = new ExtractTextPlugin({
      filename: 'static/style.css',
    });

    // Core loaders used in every situation
    const cssLoaders = [
      {
        loader: isServer && dev ? 'css-loader/locals' : 'css-loader',
        options: {
          modules: 1,
          minimize: !dev,
          sourceMap: dev,
          importLoaders: 1,
          localIdentName: dev ? '[name]_[local]_[hash:base64:5]' : '[hash:base64:10]',
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          config: {
            path: path.join(__dirname, './postcss.config.js'),
          },
          plugins: () => [
            require('autoprefixer'),
            require('postcss-csso')({ restructure: false }),
          ],
          sourceMap: dev,
        },
      },
      {
        loader: 'sass-loader',
        options: {
          outputStyle: 'expanded',
          sourceMap: dev,
        },
      },
    ];

    // Loader sequence used in development
    // On the client we also need style-loader after the default set
    const devLoaders = isServer ? cssLoaders : ['style-loader', ...cssLoaders];

    config.module.rules.push({
      test: /(\.scss|\.css)$/,
      exclude: /node_modules.*\.css$/,
      use: [
        'classnames-loader',
        // In development, each CSS module is embedded as a separate <link> tag, so they can be
        // separately hot reloaded. In production, all the CSS is bundled into one file.
        ...(dev ? devLoaders : extractCSSPlugin.extract({
          fallback: 'style-loader',
          use: cssLoaders,
        })),
      ],
    });

    // In production we need this plugin to output the final CSS file
    if (dev) {
      config.plugins.push(extractCSSPlugin);
    }

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

/**
 * Next.js plugin to add an SVG-to-JSX loader.
 * @private
 * @param {Object} [nextConfig={}] - Next.js config to decorate.
 * @returns {Object} Modified Next.hs config.
 */
const withSvgLoader = (nextConfig = {}) => Object.assign({}, nextConfig, {
  webpack(config, options) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        'babel-loader',
        'svg-to-jsx-loader',
      ],
    });

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

/**
 * Next.js plugin to insert default config values for the starter kit. Next.js allows config values
 * to be defined in two buckets: public and server. One is visible to client and server, and one is
 * visible to server only.
 *
 * Our starter kit puts values in both buckets to make things work. However, to simplify things
 * for the user, they define all their config values in one object, and we sort them into the two
 * buckets automatically. That way the user doesn't have to remember which of our config values
 * go where.
 *
 * @private
 * @param {Object} [nextConfig={}] - Next.js config to decorate.
 * @returns {Object} Modified Next.hs config.
 */
const withDefaultConfig = (nextConfig = {}) => {
  if (!nextConfig.ueno) {
    return deepAssign({}, defaultConfig, nextConfig);
  }

  // Copy the user-provided config values into the correct spots
  const serverConfigValues = Object.keys(defaultConfig.serverRuntimeConfig);
  const publicConfigValues = Object.keys(defaultConfig.publicRuntimeConfig);
  const runtimeConfig = {
    serverRuntimeConfig: pick(nextConfig.ueno, serverConfigValues),
    publicRuntimeConfig: pick(nextConfig.ueno, publicConfigValues),
  };

  return deepAssign({}, defaultConfig, runtimeConfig, nextConfig);
};

/**
 * Next.js plugin to enable offline support via service workers. This plugin only functions when
 * the app is built for production.
 * @private
 * @param {Object} [nextConfig={}] - Next.js config to decorate.
 * @returns {Object} Modified Next.hs config.
 */
const withServiceWorker = (nextConfig = {}) => {
  // Only add the plugin if it's been enabled
  if (nextConfig.serverRuntimeConfig.serviceWorker) {
    return withOffline(nextConfig);
  }

  return nextConfig;
};

const withUeno = compose(withServiceWorker, withSvgLoader, withSass, withDefaultConfig);

module.exports = withUeno;