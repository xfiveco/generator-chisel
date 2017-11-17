'use strict';

var through = require('through2');
var path = require('path');
var webpackManifestFile;

var helpers = function (gulp, plugins, config) {
  return {
    onError: function (error) {
      console.error(error.message + '\n');
      console.error(error.stack + '\n');

      this.emit('end');
    },
    removeSourceMap: function() {
      return through.obj(function(file, enc, callback) {
        delete file.sourceMap;
        this.push(file);
        callback();
      });
    },
    stealWebpackManifest: function() {
      return through.obj(function(file, enc, callback) {
        if(file.basename == 'manifest.json') {
          webpackManifestFile = file;
        } else {
          this.push(file);
        }
        callback();
      });
    },
    prepareWebpackManifest: function() {
      var pathMap = {};
      return through.obj(function(file, enc, callback) {
        this.push(file);
        if(file.path && file.revOrigPath) {
          pathMap[path.basename(file.revOrigPath)] = path.basename(file.path);
        }
        callback();
      }, function(callback) {
        if(!webpackManifestFile) {
          callback();
          return;
        }
        var webpackManifest = JSON.parse(webpackManifestFile.contents);
        Object.keys(webpackManifest).forEach((chunkName) => {
          const fileName = webpackManifest[chunkName];
          const newName = pathMap[fileName];
          if(!newName) {
            throw new Error('could not find generated file '+fileName);
          }
          webpackManifest[chunkName] = newName;
        });
        webpackManifestFile.contents = Buffer.from(JSON.stringify(webpackManifest));
        this.push(webpackManifestFile);
        callback();
      });
    }
  }
};

module.exports = helpers;
