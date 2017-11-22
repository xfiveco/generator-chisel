// Based on https://www.npmjs.com/package/name-all-modules-plugin @1.0.1

'use strict';

function NameAllModulesPlugin() {}

NameAllModulesPlugin.prototype.apply = function nameAllModulesPlugin(compiler) {
  compiler.plugin('compilation', compilation => {
    compilation.plugin('before-module-ids', modules => {
      modules.forEach(module => {
        if (module.id !== null) {
          return;
        }
        // eslint-disable-next-line no-param-reassign
        module.id = module.identifier().replace(process.cwd(), '');
      });
    });
  });
};

module.exports = NameAllModulesPlugin;
