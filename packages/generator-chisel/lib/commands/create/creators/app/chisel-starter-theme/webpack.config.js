const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const { adjustWebpackConfig } = require('chisel-scripts');

const updatedConfig = adjustWebpackConfig(defaultConfig, __dirname);

module.exports = updatedConfig;
