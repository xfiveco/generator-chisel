/* eslint-disable class-methods-use-this */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

// Based on https://github.com/danethurber/webpack-manifest-plugin/blob/v3.0.0-rc.0/lib/plugin.js#L44
const transformExtensions = /^(gz|map)$/i;
const getFileType = (str) => {
  str = str.replace(/\?.*/, '');
  const split = str.split('.');
  let ext = split.pop();
  if (transformExtensions.test(ext)) {
    ext = `${split.pop()}.${ext}`;
  }
  return ext;
};

const revisionedPathRegex = /---CHISEL-REVISIONED-PATH---([\d\w+/]*=*)---/g;

module.exports = class InjectRevisioned {
  apply(compiler) {
    let chunksMap = {};

    compiler.hooks.emit.tap('InjectRevisioned', (compilation) => {
      const map = {};
      const { chunks } = compilation
        .getStats()
        // .toJson();
        .toJson({ all: false, chunks: true });

      chunks.forEach((chunk) => {
        // console.log(chunk);
        // console.log(chunk.names, chunk.name);
        // console.log(chunk.files);
        chunk.files
          .filter((file) => !file.includes('hot-update'))
          .forEach((file) => {
            const ext = getFileType(file);
            const name = path.posix.join(
              path.posix.dirname(file),
              `${path.posix.basename(chunk.id)}.${ext}`,
            );

            map[name] = file;
          });
      });

      // console.log(map);

      chunksMap = map;
    });

    compiler.hooks.compilation.tap('InjectRevisioned', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(
        'InjectRevisioned',
        (data) => {
          data.html = data.html.replace(revisionedPathRegex, (_, pathHash) => {
            const assetPath = Buffer.from(pathHash, 'base64').toString('utf8');
            if (chunksMap[assetPath]) {
              return chunksMap[assetPath];
            }
            // return '';
            throw new Error(`File ${assetPath} seems to not be revisioned`);
          });
        },
      );
    });
  }
};
