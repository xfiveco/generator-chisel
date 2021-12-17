// eslint-plugin-import requires config to be returned synchronously
// This is absolutely awful way to do that

const { execa } = require('chisel-shared-utils');

const { stdout, stderr } = execa.sync(process.execPath, [
  ...process.execArgv,
  require.resolve('./lib//generate-and-serialize-config.js'),
]);

process.stderr.write(stderr);

// eslint-disable-next-line no-eval
const cfg = eval(`(${stdout})`);

module.exports = cfg;
