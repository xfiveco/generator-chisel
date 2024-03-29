// https://github.com/vuejs/vue-cli/blob/dcfb0bdbc948d73371f70d650f0f808f81c51cc1/packages/%40vue/cli-service/lib/commands/build/formatStats.js#L1

module.exports = function formatStats(stats, dir, assetsDir, api) {
  const fs = require('fs');
  const path = require('path');
  const zlib = require('zlib');
  const ui = require('cliui')({ width: 80 });
  const { chalk } = require('chisel-shared-utils');

  const json = stats.toJson({
    hash: false,
    modules: false,
    chunks: false,
  });

  let assets = json.assets
    ? json.assets
    : json.children.reduce((acc, child) => acc.concat(child.assets), []);

  const seenNames = new Map();
  const isJS = (val) => /\.js$/.test(val);
  const isCSS = (val) => /\.css$/.test(val);
  const isMinJS = (val) => /\.min\.js$/.test(val);
  assets = assets
    .map((a) => {
      [a.name] = a.name.split('?');
      return a;
    })
    .filter((a) => {
      if (seenNames.has(a.name)) {
        return false;
      }
      seenNames.set(a.name, true);
      return (isJS(a.name) || isCSS(a.name)) && !a.name.startsWith(assetsDir);
    })
    .sort((a, b) => {
      if (isJS(a.name) && isCSS(b.name)) return -1;
      if (isCSS(a.name) && isJS(b.name)) return 1;
      if (isMinJS(a.name) && !isMinJS(b.name)) return -1;
      if (!isMinJS(a.name) && isMinJS(b.name)) return 1;
      return b.size - a.size;
    });

  function formatSize(size) {
    return `${(size / 1024).toFixed(2)} KiB`;
  }

  function getGzippedSize(asset) {
    const filepath = api.resolve(path.join(dir, asset.name));
    const buffer = fs.readFileSync(filepath);
    return formatSize(zlib.gzipSync(buffer).length);
  }

  function makeRow(a, b, c) {
    return `  ${a}\t    ${b}\t ${c}`;
  }

  ui.div(
    `${makeRow(
      chalk.cyan.bold(`File`),
      chalk.cyan.bold(`Size`),
      chalk.cyan.bold(`Gzipped`),
    )}\n\n${assets
      .map((asset) =>
        makeRow(
          /js$/.test(asset.name)
            ? chalk.green(asset.name)
            : chalk.blue(asset.name),
          formatSize(asset.size),
          getGzippedSize(asset),
        ),
      )
      .join(`\n`)}`,
  );

  return `${ui.toString()}\n\n  ${chalk.gray(
    `Images and other types of assets omitted.`,
  )}\n`;
};
