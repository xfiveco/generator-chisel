'use strict';

const through = require('through2');
const path = require('path');
const fs = require('fs');
const ignore = require('ignore');

const IGNORE_FILENAME = '.stylelintignore';
const FILE_NOT_FOUND_ERROR_CODE = 'ENOENT';

let webpackManifestFile;

module.exports = function helpers() {
  return {
    onError(error) {
      console.error(error.message);
      console.error(error.stack);

      this.emit('end');
    },
    removeSourceMap() {
      return through.obj(function removeSourceMap(file, enc, callback) {
        // eslint-disable-next-line no-param-reassign
        delete file.sourceMap;
        this.push(file);
        callback();
      });
    },
    stealWebpackManifest() {
      return through.obj(function stealWebpackManifest(file, enc, callback) {
        if (file.basename === 'manifest.json') {
          webpackManifestFile = file;
        } else {
          this.push(file);
        }
        callback();
      });
    },
    prepareWebpackManifest() {
      const pathMap = {};
      return through.obj(
        function createPathMap(file, enc, callback) {
          this.push(file);
          if (file.path && file.revOrigPath) {
            pathMap[path.basename(file.revOrigPath)] = path.basename(file.path);
          }
          callback();
        },
        function prepareWebpackManifest(callback) {
          if (!webpackManifestFile) {
            callback();
            return;
          }
          const webpackManifest = JSON.parse(webpackManifestFile.contents);
          Object.keys(webpackManifest).forEach(chunkName => {
            const fileName = webpackManifest[chunkName];
            const newName = pathMap[fileName];
            if (!newName) {
              throw new Error(`could not find generated file ${fileName}`);
            }
            webpackManifest[chunkName] = newName;
          });
          webpackManifestFile.contents = Buffer.from(
            JSON.stringify(webpackManifest)
          );
          this.push(webpackManifestFile);
          callback();
        }
      );
    },
    prepareStylelintIgnorer() {
      // Based on https://github.com/stylelint/stylelint/blob/234372e8c8bb5f9c35952728fd18f01f5fba8890/lib/standalone.js#L49-L61
      const absoluteIgnoreFilePath = path.resolve(
        process.cwd(),
        IGNORE_FILENAME
      );
      let ignoreText = '';
      try {
        ignoreText = fs.readFileSync(absoluteIgnoreFilePath, 'utf8');
      } catch (readError) {
        if (readError.code !== FILE_NOT_FOUND_ERROR_CODE) throw readError;
      }
      return ignore().add(ignoreText);
    },
    skipIgnoredFiles(ignorer) {
      return through.obj(function stealWebpackManifest(file, enc, callback) {
        if (!ignorer.ignores(path.relative(process.cwd(), file.path))) {
          this.push(file);
        }
        callback();
      });
    },
  };
};
