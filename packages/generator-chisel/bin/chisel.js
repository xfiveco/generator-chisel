#!/usr/bin/env node

const { Command } = require('commander');

const handlePromise = (promise) =>
  promise.catch((err) => {
    if (typeof jest === 'undefined') {
      console.error(err);
      process.exit(1);
    }

    return Promise.reject(err);
  });

const createProgram = () => {
  const program = new Command();

  // TODO: commander got some big updates I think its breaking here.
  program
    .command('create')
    .description('create a new project powered by Chisel')
    .option('--skip-dependencies-install')
    .option('--skip-wp-download')
    .option('--skip-wp-config')
    .option('--skip-wp-install')
    .option('--skip-wp-commands')
    .option('--skip-wp-plugins')
    .option('--skip-fe-add-index')
    .option('--skip-format-and-build')
    .option(
      '--link',
      'link Chisel packages (yarn link) in created project (for development)',
    )
    .action((...args) => {
      console.log('COMMANDER TEST', args);
      const cmd = args.slice(-1)[0];
      args = args.slice(0, -1);
      return handlePromise(require('../lib/commands/create')({ args, cmd }));
    });

  return program;
};

(async () => {
  if (typeof jest !== 'undefined') {
    module.exports = (argv) => createProgram().parseAsync(argv);
    return;
  }

  const program = createProgram();

  program.parse(process.argv);

  if (process.argv.length <= 2) {
    program.outputHelp();
  }
})();
