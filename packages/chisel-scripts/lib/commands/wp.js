const { runWithExit } = require('chisel-shared-utils');

module.exports = (api) => {
  api.registerCommand(
    'wp',
    (command) =>
      command
        .description('run WP-CLI command')
        .allowUnknownOption()
        .helpOption('--chisel-help'),
    async () => {
      const path = require('path');

      const args = process.argv.slice(3);
      const wpCliPath = path.resolve(__dirname, '../..', 'wp-cli.phar');

      await runWithExit(['php', wpCliPath, '--color', ...args], {
        cwd: api.resolveRoot(),
      });
    },
  );
};
