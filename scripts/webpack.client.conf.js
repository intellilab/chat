const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const base = require('./webpack.base.conf');
const { merge, isProd, resolve } = require('./utils');

const config = merge(base, {
  entry: {
    app: './src/client/index.js',
  },
  output: {
    path: resolve('dist/client'),
    publicPath: '',
    filename: isProd ? '[name].[chunkhash].js' : '[name].js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks(module) {
        return (
          // it's inside node_modules
          /node_modules/.test(module.context) &&
          // and not a CSS file (due to extract-text-webpack-plugin limitation)
          !/\.css$/.test(module.request)
        );
      },
    }),
    // extract webpack runtime & manifest to avoid vendor chunk hash changing
    // on every build.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
    }),
    new HtmlWebpackPlugin({
      template: 'scripts/template.html',
    }),
  ],
});

if (isProd) {
  config.plugins.push(new SWPrecacheWebpackPlugin({
    cacheId: 'chat',
    minify: isProd,
    dontCacheBustUrlsMatching: /./,
    staticFileGlobsIgnorePatterns: [/\.map$/, /\.json$/, /\.html$/],
    runtimeCaching: [
      {
        urlPattern: '/',
        handler: 'networkFirst',
      },
    ],
  }));
}

module.exports = config;
