module.exports = (api, options) => {
  const { AsyncSeriesHook } = api.tapable;

  api.registerHooks('wordPress', {
    devMiddlewareOptions: new AsyncSeriesHook(['options']),
    hotMiddlewareOptions: new AsyncSeriesHook(['options']),
    browserSyncConfig: new AsyncSeriesHook(['config']),
  });

  ['composer', 'wp', 'wp-config', 'add-page'].forEach((command) => {
    require(`./commands/${command}`)(api, options);
  });
};
