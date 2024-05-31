const { runWithExit } = require('chisel-shared-utils');
const fs = require('fs-extra');

module.exports = (api) => {
  api.registerCommand(
    'create-block',
    (command) =>
      command
        .description('create a Gutenberg block')
        .option('-t, --template <template>', 'template to use')
        .allowUnknownOption()
        .helpOption('--chisel-help'),
    async ({ template = 'standard' }, args = []) => {
      const path = require('path');

      const targetDir = api.resolve(
        'src',
        template === 'acf' ? 'acf-blocks' : 'blocks',
      );

      const maybeTemplatePath =
        template && path.resolve(__dirname, 'templates', template);
      if (maybeTemplatePath && (await fs.pathExists(maybeTemplatePath))) {
        template = maybeTemplatePath;
      }

      await fs.ensureDir(targetDir);

      await runWithExit(
        [
          'npx',
          '--yes',
          '@wordpress/create-block@latest',
          '--template',
          template,
          '--no-plugin',
          ...args,
        ],
        {
          cwd: targetDir,
        },
      );
    },
  );
};
