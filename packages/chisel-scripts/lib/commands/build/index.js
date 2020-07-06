// TODO: no minify?
// TODO: report

module.exports = (api, options) => {
  api.registerCommand(
    'build',
    (command) =>
      command
        .description('build for production')
        .option(
          '--no-clean',
          'do not remove the dist directory before building the project',
        )
        .option('--watch', 'watch for changes')
        .option('--report', 'generate report to help analyze bundles content'),
    async (cmd) => {
      const path = require('path');
      const webpack = require('webpack');
      const { chalk } = require('chisel-shared-utils');
      const fs = require('fs-extra');
      const formatStats = require('./formatStats');

      process.env.NODE_ENV = 'production';

      if (cmd.clean) {
        await fs.remove(api.resolve(options.output.base));
      }

      const REPORT_ANALYZER_FILE_NAME = 'report-analyzer.html';
      api.chainWebpack((webpackConfig) => {
        if (cmd.report) {
          webpackConfig
            .plugin('webpack-bundle-analyzer')
            .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [
              {
                analyzerMode: 'static',
                reportFilename: REPORT_ANALYZER_FILE_NAME,
                openAnalyzer: false,
              },
            ]);
        }
      });

      const config = await api.service.resolveWebpackConfig();

      await new Promise((resolve, reject) => {
        const targetDir = api.resolve(options.output.base);
        config.watch = Boolean(cmd.watch);

        webpack(config, (err, stats) => {
          if (err) {
            reject(err);
            return;
          }

          const info = stats.toJson();

          if (stats.hasErrors()) {
            console.log(stats.toString({ colors: chalk.supportsColor }));
            reject(new Error('Build failed with errors.'));
            return;
          }

          if (stats.hasWarnings()) {
            console.warn(info.warnings);
          }

          const targetDirShort = path.relative(api.service.context, targetDir);
          const assetsDir = `${options.output.assets}/`;
          console.log();
          console.log(formatStats(stats, targetDirShort, assetsDir, api));

          resolve();
        });
      });

      if (cmd.report) {
        const slash = (str) => str.replace(/\\/g, '/');
        const { explore } = require('source-map-explorer');
        const open = require('open');

        const outAnalyzer = api.resolve(
          options.output.base,
          REPORT_ANALYZER_FILE_NAME,
        );
        const outSmScripts = api.resolve(
          options.output.base,
          'report-source-map-scripts.html',
        );
        const outSmStyles = api.resolve(
          options.output.base,
          'report-source-map-styles.html',
        );

        await Promise.all([
          explore(
            slash(
              api.resolve(options.output.base, options.output.scripts, '*.js'),
            ),
            { output: { format: 'html', filename: outSmScripts } },
          ),
          explore(
            slash(
              api.resolve(options.output.base, options.output.styles, '*.css'),
            ),
            { output: { format: 'html', filename: outSmStyles } },
          ),
        ]).then(() => {});

        console.log();
        console.log(chalk.greenBright.bold(`Reports generated:`));
        console.log(`${chalk.bold(`Webpack Bundle Analyzer:`)} ${outAnalyzer}`);
        console.log(
          `${chalk.bold(`Source map for script(s):`)} ${outSmScripts}`,
        );
        console.log(`${chalk.bold(`Source map for style(s):`)} ${outSmStyles}`);
        console.log();

        open(outAnalyzer);
        open(outSmScripts);
        open(outSmStyles);
      }
    },
  );
};
