const { runLocal } = require('chisel-shared-utils');
const plugins = require('./plugins.json');

const MCP_PLUGIN_LABEL = 'xfive MCP';
const MCP_PLUGIN_SLUG = 'xfive-mcp';

module.exports = (api) => {
  if (api.creator.cmd.skipWpPlugins) return;

  api.schedule(api.PRIORITIES.PROMPT, async () => {
    console.log('Advanced Custom Fields Pro is installed by default.');
    console.log('X5 Plato - Reliable Sync Watcher for ACF is installed by default.');

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
    const mcpSelected = selectedPlugins.includes(MCP_PLUGIN_LABEL);
    const regularPlugins = selectedPlugins.filter(
      (name) => name !== MCP_PLUGIN_LABEL,
    );

    if (regularPlugins.length > 0) {
      await runLocal(
        [
          'chisel-scripts',
          'wp',
          'plugin',
          'install',
          { activate: true },
          ...regularPlugins.map((name) => plugins.plugins[name]),
        ],
        { cwd },
      );
    }

    if (mcpSelected) {
      await runLocal(
        [
          'chisel-scripts',
          'wp',
          'plugin',
          'install',
          { activate: true, force: true },
          plugins.plugins[MCP_PLUGIN_LABEL],
        ],
        { cwd },
      );
    }
  });

  api.schedule(api.PRIORITIES.END_MESSAGE, async () => {
    const { plugins: selectedPlugins } = api.creator.data.wpPlugins;
    if (!selectedPlugins.includes(MCP_PLUGIN_LABEL)) return;

    console.log(`
ℹ️  Xfive MCP plugin was installed.
   See the plugin's README for coding-agent configuration details:
   wp-content/plugins/${MCP_PLUGIN_SLUG}/README.md
`);
  });
};
