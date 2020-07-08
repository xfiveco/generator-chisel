#!/usr/bin/env node

const { Command } = require('commander');

const handlePromise = (promise) =>
  promise.catch((err) => {
    if (!process.env.CHISEL_TEST) {
      console.error(err);
      process.exit(1);
    }

    return Promise.reject(err);
  });

const createProgram = () => {
  const program = new Command();

  program
    .command('create')
    .description('create a new project powered by Chisel')
    .option('--skip-dependencies-install')
    .option('--skip-wp-download')
    .option('--skip-wp-config')
    .option('--skip-wp-install')
    .option('--skip-wp-commands')
    .option('--skip-wp-plugins')
    .option('--skip-format-and-build')
    .option(
      '--link',
      'link Chisel packages (yarn link) in created project (for development)',
    )
    .action((...args) => {
      const cmd = args.slice(-1)[0];
      args = args.slice(0, -1);
      return handlePromise(require('../lib/commands/create')({ args, cmd }));
    });

  return program;
};

(async () => {
  if (process.env.CHISEL_TEST) {
    module.exports = (argv) => createProgram().parseAsync(argv);
    return;
  }

  const program = createProgram();

  program.parse(process.argv);

  if (process.argv.length <= 2) {
    program.outputHelp();
  }
})();
