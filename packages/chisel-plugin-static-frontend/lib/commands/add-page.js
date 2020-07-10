const markdownPageTemplate = `
---
title: <%= pageName %>
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id nulla bibendum, volutpat metus eu, pretium mi. In lobortis lobortis rutrum. Nulla eu sem nec enim tincidunt fringilla. Nunc mollis sed metus eget aliquet. In venenatis pharetra cursus. Nunc ultrices laoreet diam, at dictum risus viverra nec. Donec egestas, arcu a hendrerit ornare, nunc augue malesuada eros, nec dignissim nulla massa a enim. Phasellus porta venenatis felis, vitae congue libero pellentesque at. Sed neque sapien, faucibus vel pharetra eu, aliquet eget ipsum. Nulla vel ante enim. Sed arcu ligula, rutrum at mauris molestie, vehicula blandit sapien. Vestibulum tempor dignissim gravida.
`.substr(1);

module.exports = (api, options) => {
  api.registerCommand(
    'add-page <page...>',
    (command) =>
      command
        .description('add page(s) (creates twig templates or markdown files)')
        .option('--no-build', 'do not build after adding pages'),
    async (pages, cmd) => {
      const fs = require('fs-extra');
      const path = require('path');
      const { runLocal, chalk } = require('chisel-shared-utils');
      const { template } = require('lodash');
      const speakingUrl = require('speakingurl');
      const prettier = require('prettier');

      const runLocalCurrent = (args, opts) =>
        runLocal(args, { ...opts, cwd: api.resolve() });

      const contentDir = api.resolve(
        options.source.base,
        options.source.content,
      );

      const indexPath = api.resolve('index.html');
      const hasIndex = await fs.pathExists(indexPath);
      const isContent = await fs.pathExists(contentDir);

      let fileType = 'twig';
      let supportsNested = false;
      let targetDir = options.source.templates;
      if (isContent) {
        supportsNested = true;
        targetDir = options.source.content;

        const hasDefaultTemplate = await fs.pathExists(
          api.resolve(
            options.source.base,
            options.source.templates,
            'post.twig',
          ),
        );

        if (hasDefaultTemplate) {
          fileType = 'md';
        }
      }

      targetDir = api.resolve(options.source.base, targetDir);

      let templateCompiled;
      if (fileType === 'twig') {
        const templatesFiles = [
          api.resolve(
            options.source.base,
            options.source.templates,
            'layouts/page.twig',
          ),
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
        templateCompiled = template(templateBody, {
          sourceURL: templateFileSelected,
        });
      } else if (fileType === 'md') {
        templateCompiled = template(markdownPageTemplate);
      }

      console.log();

      const addedPages = [];

      for (const page of pages) {
        const dir = page.includes('/') ? path.posix.dirname(page) : '';
        const name = path.posix.basename(page);
        const slug = speakingUrl(name) // like project slug generation
          .replace(/(?<=[^\d])-(\d+)/g, (_, d) => d)
          .replace(/[^a-z0-9-]/g, '-');

        if (dir && !supportsNested) {
          throw new Error(
            'Nested pages are supported only when using content directory',
          );
        }

        // eslint-disable-next-line no-constant-condition
        for (let n = 0; true; n += 1) {
          const localSlug = !n ? slug : `${slug}-${n}`;
          const targetFile = path.join(
            targetDir,
            dir,
            `${localSlug}.${fileType}`,
          );

          if (!(await fs.pathExists(targetFile))) {
            await fs.outputFile(
              targetFile,
              templateCompiled({
                ...options.creatorData,
                pageDir: dir,
                pageName: name,
                pageSlug: localSlug,
              }),
            );

            addedPages.push({
              dir,
              slug: localSlug,
              name,
              path: path.posix.join(dir, `${localSlug}.html`),
            });

            console.log(chalk.greenBright.bold(`Page ${page} created!`));
            console.log(`${chalk.bold(`File:`)} ${targetFile}`);
            console.log();

            break;
          }
        }
      }

      if (hasIndex) {
        let index = await fs.readFile(indexPath, { encoding: 'utf8' });

        const templateRegex = (tpl) =>
          new RegExp(
            `<script type="text/x-chisel-${tpl}-template">(.+)(?<!</script>.*)</script>`,
            's',
          );

        if (/<!-- CHISEL-PAGES-LIST -->/.exec(index)) {
          const pagesTemplateRegex = templateRegex('pages');
          index = index
            .replace(
              /<!-- CHISEL-PAGES-LIST -->/,
              pagesTemplateRegex.exec(index)[1],
            )
            .replace(pagesTemplateRegex, '');
        }

        const pageTemplateRegex = templateRegex('page');
        const indexPageTemplate = pageTemplateRegex.exec(index)[1];
        const indexPageTemplateCompiled = template(indexPageTemplate);

        index = index.replace(
          /(?=<!-- CHISEL-PAGES -->)/,
          `${addedPages
            .map((page) => indexPageTemplateCompiled({ page }))
            .join('\n')}\n`,
        );

        index = prettier.format(index, {
          ...prettier.resolveConfig.sync(indexPath),
          filepath: indexPath,
        });

        await fs.writeFile(indexPath, index);

        if (cmd.build) {
          await runLocalCurrent(['chisel-scripts', 'build'], {
            execaOpts: { stdio: 'inherit' },
          });
        }
      }
    },
  );
};
