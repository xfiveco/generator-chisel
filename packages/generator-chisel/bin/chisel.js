#!/usr/bin/env node

const program = require('commander');

const handlePromise = (promise) =>
  promise.catch((err) => {
    console.error(err);
    process.exit(1);
  });

program
  .command('create')
  .description('create a new project powered by Chisel')
  .option('--skip-wp-download')
  .option('--skip-wp-config')
  .option('--skip-wp-install')
  .option('--skip-wp-plugins')
  .option(
    '--link',
    'link Chisel packages (yarn link) in created project (for development)',
  )
  .action((...args) => {
    const cmd = args.slice(-1)[0];
    args = args.slice(0, -1);
    handlePromise(require('../lib/commands/create')({ args, cmd }));
  });

(async () => {
  // TODO: check updates

  program.parse(process.argv);

  if (process.argv.length <= 2) {
    program.outputHelp();
  }
})();
