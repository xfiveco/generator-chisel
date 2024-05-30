const { runWithExit } = require('chisel-shared-utils');

module.exports = (api) => {
  api.registerCommand(
    'composer',
    (command) =>
      command
        .description('run Composer command')
        .allowUnknownOption()
        .helpOption('--chisel-help'),
    async () => {
      const path = require('path');

      const args = process.argv.slice(3);
      const composerPath = path.resolve(__dirname, '../..', 'composer.phar');

      await runWithExit(['php', composerPath, '--ansi', ...args], {
        cwd: api.resolve(),
      });
    },
  );
};
