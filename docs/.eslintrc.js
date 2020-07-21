process.env.CHISEL_CONTEXT = __dirname;
const chiselConfig = require('./chisel.config.js');

let extend = 'chisel';

if (chiselConfig.react) {
  extend = 'chisel/react';
}

module.exports = {
  root: true,

  extends: extend,

  settings: {
    'import/resolver': {
      node: {},
      [require.resolve(
        'chisel-plugin-code-style/eslint-import-resolver-webpack',
      )]: {
        config: require.resolve('chisel-scripts/webpack.config-sync.js'),
      },
    },
  },
};
