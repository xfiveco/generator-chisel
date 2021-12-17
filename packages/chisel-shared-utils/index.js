['package-manager', 'run', 'copy'].forEach((lib) => {
  Object.assign(exports, require(`./lib/${lib}`));
});

exports.execa = require('execa');
exports.chalk = require('chalk');
