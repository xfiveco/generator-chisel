module.exports = (api) => {
  api.registerCommand(
    'composer',
    (command) =>
      command
        .description('run Composer command')
        .allowUnknownOption()
        .helpOption('--chisel-help'),
    async () => {
      const execa = require('execa');
      const path = require('path');

      const args = process.argv.slice(3);
      const composerPath = path.resolve(__dirname, '..', 'composer.phar');

      try {
        // TODO: use: reject: false
        // TODO: use chisel-shared-utils
        const wp = await execa('php', [composerPath, '--ansi', ...args], {
          stdio: 'inherit',
          cwd: api.resolve(),
        });
        process.exit(wp.exitCode);
      } catch (e) {
        process.exit(e.exitCode);
      }
    },
  );
};
