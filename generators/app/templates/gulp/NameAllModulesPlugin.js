// Based on https://www.npmjs.com/package/name-all-modules-plugin @1.0.1

function NameAllModulesPlugin() {}

NameAllModulesPlugin.prototype.apply = function(compiler) {
  compiler.plugin('compilation', compilation => {
    compilation.plugin('before-module-ids', modules => {
      modules.forEach(module => {
        if (module.id !== null) {
          return;
        }
        module.id = module.identifier().replace(process.cwd(), '');
      });
    });
  });
};

module.exports = NameAllModulesPlugin;
