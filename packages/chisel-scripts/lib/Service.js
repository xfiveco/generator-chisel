// Based on https://github.com/vuejs/vue-cli/blob/80b93951b1710733a66765cbd535b12b7bb59279/packages/%40vue/cli-service/lib/Service.js

const path = require('path');
const { defaultsDeep } = require('lodash');
const { Command } = require('commander');
const PluginAPI = require('./PluginAPI');

module.exports = class Service {
  constructor(context) {
    this.initialized = false;
    this.webpackChainFns = [];
    this.webpackRawConfigFns = [];

    this.program = new Command('chisel-scripts');
    this.programCommands = {};
    this.context = context || process.env.CHISEL_CONTEXT || process.cwd();
    this.plugins = this.loadPlugins();
  }

  // eslint-disable-next-line class-methods-use-this
  loadPlugins() {
    const idToPlugin = (id) => ({
      id: id.replace(/^.\//, 'built-in:'),
      apply: require(id),
    });

    const builtInPlugins = [
      'build',
      'start',
      'composer',
      'wp',
      'wp-config',
      'add-page',
    ].map((id) => `./commands/${id}`);

    const plugins = [];

    plugins.push(...builtInPlugins.map(idToPlugin));

    return plugins;
  }

  async initializePlugins() {
    const plugins = [...this.plugins];

    for (const { id, apply } of plugins) {
      await apply(new PluginAPI(id, this), this.projectOptions);
    }
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    this.program.version(require('../package.json').version);

    const packageJson = require(path.resolve(this.context, 'package.json'));

    this.projectOptions = { ...packageJson.chisel };

    await this.initializePlugins();
  }

  async run(name, args = []) {
    await this.init();

    const commanderArgs = [...(name ? [name] : []), ...args];

    await this.program.parseAsync(commanderArgs, { from: 'user' });
    if (this.program._actionResults) {
      const results = await Promise.all(this.program._actionResults);
      if (results.length === 1) {
        return results[0];
      }

      return results;
    }

    return undefined;
  }
};
