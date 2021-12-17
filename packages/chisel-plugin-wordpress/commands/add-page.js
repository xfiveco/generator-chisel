module.exports = (api, options) => {
  api.registerCommand(
    'add-page <page...>',
    (command) =>
      command.description(
        'add page(s) (creates twig templates and entries in WP)',
      ),
    async (pages) => {
      const fs = require('fs-extra');
      const { runLocal, chalk } = require('chisel-shared-utils');
      const { kebabCase, template } = require('lodash');

      const wp = (args, opts) =>
        runLocal(['chisel-scripts', 'wp', ...args], {
          ...opts,
          cwd: api.resolve(),
        });

      const { wp: wpOptions } = options;
      const theme = `${wpOptions.directoryName}/wp-content/themes/${wpOptions.themeName}`;
      const templatesFiles = [
        api.resolve(theme, options.source.templates, 'layouts/page.twig'),
      ];

      let templateFileSelected;

      for (const file of templatesFiles) {
        if (await fs.pathExists(file)) {
          templateFileSelected = file;
          break;
        }
      }

      const templateBody = await fs.readFile(templateFileSelected, {
        encoding: 'utf8',
      });
      const templateCompiled = template(templateBody, {
        sourceURL: templateFileSelected,
      });

      console.log();

      for (const page of pages) {
        // let slug = '';

        const createPost = await wp(
          [
            'post',
            'create',
            { post_type: 'page', post_title: page, post_status: 'publish' },
          ],
          { silent: true },
        );

        const id = /Created post (\d+)\./.exec(createPost.stdout)[1];

        if (!id) {
          throw new Error('Post id not found');
        }

        const postDetailsCmd = await wp(
          ['post', 'get', id, { format: 'json' }],
          { silent: true },
        );

        const postDetails = JSON.parse(postDetailsCmd.stdout);

        const slug = postDetails.post_name;
        const targetFileName = `page-${slug}.twig`;
        const targetPath = api.resolve(
          theme,
          options.source.templates,
          targetFileName,
        );

        await fs.outputFile(
          targetPath,
          templateCompiled({
            ...options.creatorData,
            pageName: page,
            pageSlug: slug,
          }),
        );

        console.log(chalk.greenBright.bold(`Page ${page} created!`));
        console.log(`${chalk.bold(`Template:`)} ${targetPath}`);
        console.log(`${chalk.bold(`URL:`)} ${postDetails.guid}`);
        console.log();
      }
    },
  );
};
