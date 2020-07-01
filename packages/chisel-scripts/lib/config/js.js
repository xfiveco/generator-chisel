// TODO: allow easy inclusion of selected node modules
// cache loader?

module.exports = (api) => {
  api.chainWebpack((webpackConfig) => {
    // prettier-ignore
    webpackConfig.module.rule('js').test(/\.m?jsx?$/).exclude.add(/node_modules/).end()
      .use('babel-loader')
        .loader(require.resolve('babel-loader'))

    webpackConfig.optimization
      .minimizer('js')
      .use(require.resolve('terser-webpack-plugin'));
  });
};
