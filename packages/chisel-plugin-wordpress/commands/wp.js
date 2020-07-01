module.exports = (api) => {
  api.registerCommand(
    'wp',
    (command) => command.description('run WP-CLI command').allowUnknownOption(),
    async () => {
      const execa = require('execa');
      const path = require('path');

      const args = process.argv.slice(3);
      const wpCliPath = path.resolve(__dirname, '..', 'wp-cli.phar');

      try {
        // TODO: use: reject: false
        // TODO: use chisel-shared-utils
        const wp = await execa('php', [wpCliPath, '--color', ...args], {
          stdio: 'inherit',
        });
        process.exit(wp.exitCode);
      } catch (e) {
        process.exit(e.exitCode);
      }
    },
  );
};
