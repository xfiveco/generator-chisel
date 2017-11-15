var path = require('path');
var fs = require('fs');
var chalk = require('chalk');

module.exports = function(data) {
  data = data || {};

  const webpackManifestPath = path.join(
    data.config.dest.base,
    data.config.dest.scripts,
    'manifest' + (!data.manifest ? '-dev' : '') + '.json'
  );

  var functions = [
    {
      name: 'revisionedPath',
      func: function (fullPath) {
        var pathToFile = path.basename(fullPath);
        if (data.manifest) {
          if(!data.manifest[pathToFile]) {
            throw new Error('File '+pathToFile+' seems to not be revisioned');
          }
          return path.join(path.dirname(fullPath),
            data.manifest[pathToFile]);
        } else {
          return fullPath;
        }
      }
    },
    {
      name: 'assetPath',
      func: function (assetPath) {
        return path.join(data.config.dest.assets, assetPath);
      }
    },
    {
      name: 'className',
      func: function () {
        var args = Array.prototype.slice.call(arguments);
        var name = args.shift();
        if(typeof name != 'string' || name == '') {
          return '';
        }
        var classes = [name];
        var el;
        for(var i = 0; i < args.length; i++) {
          el = args[i];
          if(el && typeof el == 'string') {
            classes.push(name + '--' + el);
          }
        }
        return classes.join(' ');
      }
    },
    {
      name: 'hasVendor',
      func: function () {
        if (!data.manifest) {
          return fs.existsSync( path.join(data.config.dest.base, data.config.dest.scripts, 'vendor.js') );
        }

        return !!data.manifest['vendor.js'];
      }
    },
    {
      name: 'getScriptsPath',
      func: function() {
        return 'scripts/';
      },
    },
    {
      name: 'hasWebpackManifest',
      func: function() {
        return fs.existsSync(webpackManifestPath);
      },
    },
    {
      name: 'getWebpackManifest',
      func: function() {
        return fs.readFileSync(webpackManifestPath, 'utf8');
      },
    },
  ];

  return functions;
}
