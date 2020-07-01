// TODO: not tested

module.exports = function chiselPreactPreset(api, options) {
  const {
    pragma = 'h',
    pragmaFrag = 'Fragment',
    processOptions = (_, opts) => opts,
  } = options;

  return {
    plugins: [
      [
        require('@babel/plugin-transform-react-jsx'),
        processOptions('@babel/plugin-transform-react-jsx', {
          pragma,
          pragmaFrag,
          useBuiltIns: true,
        }),
      ],
    ],
  };
};
