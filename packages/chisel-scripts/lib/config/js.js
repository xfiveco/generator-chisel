// TODO: allow easy inclusion of selected node modules
// cache loader?

const path = require('path');

const isWindows = process.platform === 'win32';
// https://github.com/vuejs/vue-cli/blob/544e0547054947c471fe9d71a2b967e57f5f3111/packages/%40vue/cli-plugin-babel/index.js
function genTranspileDepRegex(transpileDependencies) {
  const deps = transpileDependencies.map((dep) => {
    if (typeof dep === 'string') {
      const depPath = path.join('node_modules', dep, '/');
      return isWindows
        ? depPath.replace(/\\/g, '\\\\') // double escape for windows style path
        : depPath;
    }
    if (dep instanceof RegExp) {
      return dep.source;
    }
    return undefined;
  });
  return deps.length ? new RegExp(deps.join('|')) : null;
}

module.exports = (api, options) => {
  api.chainWebpack((webpackConfig) => {
    const transpileDepRegex = genTranspileDepRegex(
      options.transpileDependencies || [],
    );

    const excludeFunction = (filepath) => {
      if (transpileDepRegex && transpileDepRegex.test(filepath)) {
        return false;
      }
      // Don't transpile node_modules
      return /node_modules/.test(filepath);
    };

    // prettier-ignore
    webpackConfig.module.rule('js')
      .test(/\.m?jsx?$/)
      .exclude
        .add(excludeFunction)
        .add(api.resolve(options.source.base, options.source.assets))
        .end()
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))

    webpackConfig.optimization
      .minimizer('js')
      .use(require.resolve('terser-webpack-plugin'));
  });
};
