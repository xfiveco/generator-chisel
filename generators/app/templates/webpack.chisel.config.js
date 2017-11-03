// This is webpack configuration,
// TODO: extend comment

const webpack = require('webpack-stream').webpack;
const path = require('path');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const NameAllModulesPlugin = require('./gulp/NameAllModulesPlugin');

//eslint-disable-next-line
const IS_DEVELOPMENT = process.env.NODE_ENV == 'development';
//eslint-disable-next-line
const IS_PRODUCTION = process.env.NODE_ENV == 'production';

const config = {
  output: {
    filename: '[id].bundle.js',
    chunkFilename: '[id].chunk.js',
  },
  externals: {
    // jquery: 'window.jQuery',
  },
  devtool: 'inline-source-map',
  stats: 'normal',
  watch: IS_DEVELOPMENT,
  module: {<% if (features.has_babel) { %>
    rules: [{ test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }],
  <% } %>},
  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NamedChunksPlugin(chunk => {
      if (chunk.name) {
        return chunk.name;
      }
      return (
        chunk
          .mapModules(m => {
            const file = path.relative(m.context, m.request);
            return path.basename(file, path.extname(file)) + '-' + m.id;
          })
          .join('_') + '.c'
      );
    }),
    new NameAllModulesPlugin(),
    new ChunkManifestPlugin({
      filename: 'manifest' + (!IS_PRODUCTION ? '-dev' : '') + '.json',
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
};

module.exports = () =>
  // eslint-disable-next-line
  new Promise(resolve => {
    resolve(config);
  });
