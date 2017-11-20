'use strict';

const through = require('through2');
const path = require('path');

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
  };
};
