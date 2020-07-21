const creatorData = {
  chiselVersion: '1.0.0-alpha.8',
  app: {
    name: 'Getchisel',
    author: 'Xfive',
    projectType: 'fe',
    browsers: ['modern', 'edge18', 'ie11'],
    nameSlug: 'getchisel',
    hasJQuery: false,
  },
  fe: { additionalFeatures: ['serveDist', 'skipHtmlExtension'] },
};

module.exports = {
  creatorData,

  staticFrontend: {
    serveDist: true,
    skipHtmlExtension: true,
  },

  // To use React and hot reload for react components:
  // 1. Run `yarn add react-hot-loader @hot-loader/react-dom`
  // 3. Mark your root component as hot-exported as described on
  //    https://github.com/gaearon/react-hot-loader
  // 4. Uncomment line below
  // react: true,

  plugins: ['chisel-plugin-code-style', 'chisel-plugin-static-frontend'],

  // https://cli.vuejs.org/config/#configurewebpack
  // configureWebpack(config) {},
  // chainWebpack(config) {},

  // Hooks can be used to change internal behavior, for example:
  // documentation TBD :(
  // hooks: {
  //   wordPress: {
  //     browserSyncConfig(config) {
  //       // disable opening of browser window when dev server starts
  //       // eslint-disable-next-line no-param-reassign
  //       config.open = false;
  //     },
  //   },
  // },
};
