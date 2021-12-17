const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HTMLHint } = require('htmlhint');
const { chalk } = require('chisel-shared-utils');
const path = require('path');

class HtmlHintPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    let htmlProblems = [];
    const problemsCache = {};

    compiler.hooks.compilation.tap('HtmlHintPlugin', (compilation) => {
      const { htmlHintConfig, distPath } = this.options;
      const normalizedConfig = {
        ...HTMLHint.defaultRuleset,
        ...htmlHintConfig,
      };

      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(
        'HtmlHintPlugin',
        (data) => {
          const { outputName, html } = data;
          const messages = HTMLHint.verify(html, normalizedConfig);

          const cached = problemsCache[outputName];

          if (cached && cached.html === html) {
            if (cached.report) {
              htmlProblems.push(cached.report);
            }

            return;
          }

          if (messages && messages.length > 0) {
            const messagesText = HTMLHint.format(messages, {
              colors: chalk.supportsColor,
            })
              .map((msg) => msg.split('\x1b[31m').join('\x1b[33m'))
              .join('\n');
            const fileName = chalk.bold(
              `${path.resolve(distPath, data.outputName)}:`,
            );
            const report = `${fileName}\n${messagesText}`;

            problemsCache[outputName] = { html, report };
            htmlProblems.push(report);
          } else {
            problemsCache[outputName] = { html, report: '' };
          }
        },
      );
    });

    compiler.hooks.done.tap('HtmlHintPlugin', () => {
      if (htmlProblems.length > 0) {
        console.log();
        console.log(htmlProblems.join('\n\n'));
        console.log();
        htmlProblems = [];

        if (process.env.NODE_ENV === 'production') {
          throw new Error('Problems found when checking with HTML Hint');
        }
      }
    });
  }
}

module.exports = HtmlHintPlugin;
