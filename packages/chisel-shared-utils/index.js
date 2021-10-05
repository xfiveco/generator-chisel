['package-manager', 'run', 'copy', 'host'].forEach((lib) => {
  Object.assign(exports, require(`./lib/${lib}`));
});

exports.execa = require('execa');
exports.chalk = require('chalk');
