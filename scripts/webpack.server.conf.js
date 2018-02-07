const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals');
const base = require('./webpack.base.conf')
const { merge, isProd, resolve } = require('./utils');

module.exports = merge(base, {
  target: 'node',
  devtool: false,
  entry: './src/server/index.js',
  output: {
    path: resolve('dist/server'),
    filename: 'index.js',
  },
  externals: nodeExternals({
    whitelist: /\.css$/,
  }),
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
});
