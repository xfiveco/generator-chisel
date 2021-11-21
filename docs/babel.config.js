const chiselConfig = require('./chisel.config.js');

module.exports = {
  presets: [
    [
      'babel-preset-chisel',
      {
        // global automatic polyfills:
        // yarn add core-js then uncomment
        // useBuiltIns: 'usage',
      },
    ],
    chiselConfig.react && ['babel-preset-chisel/react', { hot: true }],
    // ['babel-preset-chisel/preact'],
  ].filter(Boolean),
};
