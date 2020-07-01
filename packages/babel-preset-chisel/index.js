const path = require('path');

module.exports = function chiselPreset(api, options = {}) {
  const runtimePath = path.dirname(
    require.resolve('@babel/runtime/package.json'),
  );
  const runtimeVersion = require('@babel/runtime/package.json').version;

  const {
    modules = false,
    bugfixes = true,
    useBuiltIns = false,
    shippedProposals = true,

    // Undocumented option of @babel/plugin-transform-runtime.
    // When enabled, an absolute path is used when importing a runtime helper after transforming.
    // This ensures the transpiled file always use the runtime version required in this package.
    // However, this may cause hash inconsistency if the project is moved to another directory.
    // So here we allow user to explicit disable this option if hash consistency is a requirement
    // and the runtime version is sure to be correct.
    absoluteRuntime = runtimePath,
    // TODO: do we want that?

    // https://babeljs.io/docs/en/babel-plugin-transform-runtime#version
    // By default transform-runtime assumes that @babel/runtime@7.0.0-beta.0 is installed, which means helpers introduced later than 7.0.0-beta.0 will be inlined instead of imported.
    // See https://github.com/babel/babel/issues/10261
    // And https://github.com/facebook/docusaurus/pull/2111
    version = runtimeVersion,

    processOptions = (_, opts) => opts,
  } = options;

  return {
    presets: [
      [
        require('@babel/preset-env'),
        processOptions('@babel/preset-env', {
          modules,
          bugfixes,
          useBuiltIns,
          // eslint-disable-next-line import/no-unresolved
          corejs: useBuiltIns ? require('core-js/package.json').version : false,
          shippedProposals,
        }),
      ],
    ],
    plugins: [
      [
        require('@babel/plugin-transform-runtime'),
        processOptions('@babel/plugin-transform-runtime', {
          regenerator: useBuiltIns !== 'usage',

          // polyfills are injected by preset-env & polyfillsPlugin, so no need to add them again
          corejs: false,

          helpers: true,
          useESModules: !modules,

          absoluteRuntime,

          version,
        }),
      ],
    ],
  };
};
