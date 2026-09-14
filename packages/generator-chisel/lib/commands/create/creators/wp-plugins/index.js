const { runLocal } = require('chisel-shared-utils');
const plugins = require('./plugins.json');

module.exports = (api) => {
  if (api.creator.cmd.skipWpPlugins) return;

  api.schedule(api.PRIORITIES.PROMPT, async () => {
    console.log('Advanced Custom Fields Pro is installed by default.');
    console.log(
      'X5 Plato - Reliable Sync Watcher for ACF is installed by default.',
    );

    await api.prompt([
      {
        type: 'checkbox',
        name: 'plugins',
        message: 'Select optional plugins',
        choices: Object.keys(plugins.plugins),
      },
    ]);
  });

  api.schedule(api.PRIORITIES.WP_PLUGINS, async () => {
    const { plugins: selectedPlugins } = api.creator.data.wpPlugins;
    if (selectedPlugins.length === 0) return;

    const cwd = api.resolve(api.creator.data.app.themePath);

    await runLocal(
      [
        'chisel-scripts',
        'wp',
        'plugin',
        'install',
        { activate: true },
        ...selectedPlugins.map((name) => plugins.plugins[name]),
      ],
      { cwd },
    );
  });

  api.schedule(api.PRIORITIES.END_MESSAGE, async () => {
    const { plugins: selectedPlugins } = api.creator.data.wpPlugins;
    if (!selectedPlugins.includes('xfive MCP')) return;

    console.log(`
ℹ️  Xfive MCP plugin was installed.
   See the plugin's README for coding-agent configuration details:
   wp-content/plugins/xfive-mcp/README.md
`);
  });
};
