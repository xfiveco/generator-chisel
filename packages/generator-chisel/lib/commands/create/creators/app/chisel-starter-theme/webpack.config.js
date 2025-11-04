const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const { adjustWebpackConfig } = require('chisel-scripts');

const updatedConfig = adjustWebpackConfig(defaultConfig, __dirname);

updatedConfig.devServer = {
  ...updatedConfig.devServer,
  client: {
    overlay: {
      errors: true,
      warnings: false,
      runtimeErrors: false,
    },
  },
};

module.exports = updatedConfig;
