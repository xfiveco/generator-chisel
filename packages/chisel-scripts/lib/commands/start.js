const { runLocalWithExit } = require('chisel-shared-utils');

module.exports = (api) => {
  api.registerCommand(
    'start',
    (command) => command.description('start development server'),
    async () => {
      process.env.NODE_ENV = 'development';

      // TODO: custom scripts

      await runLocalWithExit(['wp-scripts', 'start', '--hot'], {
        cwd: api.resolve(),
      });
    },
  );
};
