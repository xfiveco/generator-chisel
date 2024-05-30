const { runLocalWithExit } = require('chisel-shared-utils');

module.exports = (api) => {
  api.registerCommand(
    'build',
    (command) => command.description('build for production'),
    // .option(
    //   '--no-clean',
    //   'do not remove the dist directory before building the project',
    // )
    // .option('--watch', 'watch for changes')
    // .option('--report', 'generate report to help analyze bundles content')
    async () => {
      process.env.NODE_ENV = 'production';

      // TODO: custom scripts

      await runLocalWithExit(['wp-scripts', 'build'], {
        cwd: api.resolve(),
      });
    },
  );
};
