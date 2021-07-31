const RuntimeGlobals = require('webpack/lib/RuntimeGlobals');
const RuntimeModule = require('webpack/lib/RuntimeModule');

class ChiselDynamicPublicPathRuntimeModule extends RuntimeModule {
  constructor() {
    super('publicPath', RuntimeModule.STAGE_BASIC);
  }

  generate() {
    return (
      '\n\n// Chisel: Allow public path to be modified during runtime\n' +
      `${RuntimeGlobals.publicPath} = (typeof document !== "undefined" && document.documentElement.dataset.webpackPublicPath) || ${RuntimeGlobals.publicPath} || '/';`
    );
  }
}

class DynamicPublicPath {
  constructor(options = {}) {
    this.options = options;
  }

  // eslint-disable-next-line class-methods-use-this
  apply(compiler) {
    compiler.hooks.compilation.tap('DynamicPublicPath', (compilation) => {
      // based on https://github.com/webpack/webpack/blob/c181294865dca01b28e6e316636fef5f2aad4eb6/lib/RuntimePlugin.js#L177
      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.publicPath)
        .tap('DynamicPublicPath', (chunk, set) => {
          const module = new ChiselDynamicPublicPathRuntimeModule();
          compilation.addRuntimeModule(chunk, module);
          return true;
        });
    });
  }
}

module.exports = DynamicPublicPath;
