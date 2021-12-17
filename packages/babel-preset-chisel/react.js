// TODO: not tested

// possible improvements:
// * @babel/plugin-transform-react-constant-elements
// * automatic mode?

module.exports = function chiselReactPreset(api, options) {
  const env = api.env(); // TODO: test
  const {
    pragma,
    pragmaFrag,
    hot = false,
    processOptions = (_, opts) => opts,
  } = options;

  const isDevelopment = env === 'development' || env === 'test';

  return {
    presets: [
      [
        require('@babel/preset-react'),
        processOptions('@babel/preset-react', {
          pragma,
          pragmaFrag,
          useBuiltIns: true,
          development: isDevelopment,
        }),
      ],
    ],
    plugins: [...(hot ? ['react-hot-loader/babel'] : [])],
  };
};
