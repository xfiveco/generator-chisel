#!/usr/bin/env node

const { Command } = require('commander');

const createProgram = () => {
  const program = new Command();

  program
    .command('create', { isDefault: true })
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
      return require('../lib/commands/create')({ args, cmd });
    });

  return program;
};

(async () => {
  const program = createProgram();

  program.parse(process.argv);
})();
