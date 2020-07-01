module.exports = (api) => {
  api.registerCommand(
    'inspect',
    (command) => command.description('inspect internal webpack config'),
    async () => {
      const { toString } = require('webpack-chain');
      const { highlight } = require('cli-highlight');

      const config = await api.service.resolveWebpackConfig();

      console.log(highlight(toString(config), { language: 'js' }));
    },
  );
};
