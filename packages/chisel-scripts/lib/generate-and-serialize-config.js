console.log = console.error.bind(console);

const { toString } = require('webpack-chain');
const config = require('../webpack.config');

config.then((cfg) => {
  cfg.plugins = []; // problems with serialization
  process.stdout.write(toString(cfg, { verbose: true }));
});
