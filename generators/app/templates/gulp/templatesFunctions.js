'use strict';

const path = require('path');
const fs = require('fs');

module.exports = function templateFunctions(data = {}) {
  const webpackManifestPath = path.join(
    data.config.dest.base,
    data.config.dest.scripts,
    `manifest${!data.manifest ? '-dev' : ''}.json`
  );

  return [
    {
      name: 'revisionedPath',
      func(fullPath) {
        const pathToFile = path.basename(fullPath);
        if (data.manifest) {
          if (!data.manifest[pathToFile]) {
            throw new Error(`File ${pathToFile} seems to not be revisioned`);
          }
          return path.join(path.dirname(fullPath), data.manifest[pathToFile]);
        }

        return fullPath;
      },
    },
    {
      name: 'assetPath',
      func(assetPath) {
        return path.join(data.config.dest.assets, assetPath);
      },
    },
    {
      name: 'className',
      func(...args) {
        const name = args.shift();
        if (typeof name !== 'string' || name === '') {
          return '';
        }
        const classes = [name];
        let el;
        for (let i = 0; i < args.length; i += 1) {
          el = args[i];
          if (el && typeof el === 'string') {
            classes.push(`${name}--${el}`);
          }
        }
        return classes.join(' ');
      },
    },
    {
      name: 'hasVendor',
      func() {
        if (!data.manifest) {
          return fs.existsSync(
            path.join(
              data.config.dest.base,
              data.config.dest.scripts,
              'vendor.js'
            )
          );
        }

        return !!data.manifest['vendor.js'];
      },
    },
    {
      name: 'getScriptsPath',
      func() {
        return 'scripts/';
      },
    },
    {
      name: 'hasWebpackManifest',
      func() {
        return fs.existsSync(webpackManifestPath);
      },
    },
    {
      name: 'getWebpackManifest',
      func() {
        return fs.readFileSync(webpackManifestPath, 'utf8');
      },
    },
  ];
};
