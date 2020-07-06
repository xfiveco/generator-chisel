module.exports = (api, options) => {
  api.registerCommand(
    'lint [files...]',
    async (command) =>
      command
        .description('lint and fix source files')
        .option('--no-fix', 'do not fix errors or warnings'),
    async (files, cmd) => {
      const globby = require('globby');
      const fs = require('fs-extra');
      const slash = (str) => str.replace(/\\/g, '/');

      const cwd = api.resolve();
      let isUsingDefaultPaths = false;

      if (files.length === 0) {
        files = ['**/*.{js,scss}'];
        isUsingDefaultPaths = true;
      }

      const wpDir = (options.wp || {}).directoryName;

      const ignore = [
        ...(wpDir
          ? [
              `${wpDir}/wp-admin`,
              `${wpDir}/wp-includes`,
              `${wpDir}/wp-content/plugins`,
            ]
          : []),
        'node_modules',
        '.git',
      ].filter(Boolean);

      const filesNormalized = [].concat(
        ...(await Promise.all(
          files.map(async (file) => {
            const fileAbs = api.resolve(file);
            if (await fs.pathExists(fileAbs)) {
              return slash(fileAbs); // required for stylelint
            }

            return globby(file, {
              cwd,
              absolute: true,
              dot: true,
              ignore,
            });
          }),
        )),
      );

      // console.log(filesNormalized);
      // fs.writeFileSync(
      //   __dirname + '/tmp.json',
      //   JSON.stringify(filesNormalized)
      // );

      if (filesNormalized.length === 0) {
        console.error('No files found');
        process.exit(1);
      }

      const jsFiles = filesNormalized.filter((file) => file.endsWith('.js'));
      const scssFiles = filesNormalized.filter((file) =>
        file.endsWith('.scss'),
      );
      const hasJS = jsFiles.length > 0;
      const hasScss = scssFiles.length > 0;
      let exit = 0;

      if (hasJS) {
        const { CLIEngine } = require('eslint');
        const path = require('path');

        const config = {
          cwd,
          fix: cmd.fix,
        };

        const engine = new CLIEngine(config);

        const jsFileNotIgnored = jsFiles.filter((file) => {
          try {
            return !engine.isPathIgnored(file);
          } catch (e) {
            if (isUsingDefaultPaths) {
              return false;
            }

            throw e;
          }
        });

        // https://github.com/vuejs/vue-cli/blob/a41cac220a5bc5e5305807f5249178cbcbf642f4/packages/%40vue/cli-plugin-eslint/lint.js#L72
        const processCwd = process.cwd;
        process.cwd = () => cwd;

        const report = engine.executeOnFiles(jsFileNotIgnored);

        process.cwd = processCwd;

        const formatter = engine.getFormatter('codeframe');

        if (config.fix) {
          CLIEngine.outputFixes(report);
        }

        if (report.errorCount > 0) {
          exit = 1;
        }

        const hasFixed = report.results.some((f) => f.output);
        if (hasFixed) {
          console.log(`The following JS files have been auto-fixed:`);
          console.log();
          report.results.forEach((f) => {
            if (f.output) {
              console.log(`  ${path.relative(cwd, f.filePath)}`);
            }
          });
          console.log();
        }

        if (report.warningCount || report.errorCount) {
          console.log(formatter(report.results));
        } else {
          console.log(
            hasFixed
              ? `All JS lint issues auto-fixed.`
              : `No JS lint issues found!`,
          );
        }
      }

      if (hasScss) {
        // inspired by https://github.com/olegskl/gulp-stylelint/blob/95921fed4cea5b11feb04395675d3abeb38464db/src/index.js
        const stylelint = require('stylelint');

        const config = {
          fix: cmd.fix,
          configBasedir: cwd,
          globbyOptions: { cwd },
          files: scssFiles,
          formatter: 'string',
          allowEmptyInput: true,
        };

        const resultObject = await stylelint.lint(config);

        if (resultObject.errored) {
          exit = 1;
        } else if (!resultObject.output) {
          console.log(`No SCSS lint issues found OR all issues auto-fixed.`);
        }

        if (resultObject.output) {
          console.log(resultObject.output);
        }
      }

      process.exit(exit);
    },
  );
};
