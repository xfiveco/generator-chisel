// Based on https://github.com/vuejs/vue-cli/blob/80b93951b1710733a66765cbd535b12b7bb59279/packages/%40vue/cli-service/lib/Service.js

const path = require('path');
const { defaultsDeep } = require('lodash');
const { Command } = require('commander');
const { AsyncSeriesHook } = require('tapable');
const PluginAPI = require('./PluginAPI');

module.exports = class Service {
  constructor(context) {
    this.initialized = false;
    this.webpackChainFns = [];
    this.webpackRawConfigFns = [];

    this.hooksBase = Object.freeze({
      pluginsToInitialize: new AsyncSeriesHook(['plugins']),
      pluginsInitialized: new AsyncSeriesHook([]),
      projectOptionsLoaded: new AsyncSeriesHook(['options']),
      configHooksLoaded: new AsyncSeriesHook(['service']),
    });
    this.hooksFromPlugins = {};
    this.hooks = this.hooksBase;

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
      // './commands/serve',
      './commands/build',
      // './config/prod',
    ];

    const plugins = [];

    plugins.push(...builtInPlugins.map(idToPlugin));

    return plugins;
  }

  async initializePlugins() {
    const plugins = [...this.plugins];
    await this.hooks.pluginsToInitialize.promise(plugins);

    for (const { id, apply } of plugins) {
      await apply(new PluginAPI(id, this), this.projectOptions);
    }

    await this.hooks.pluginsInitialized.promise();
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    this.program.version(require('../package.json').version);

    const packageJson = require(path.resolve(this.context, 'package.json'));

    this.projectOptions = { ...packageJson.chisel };

    // TODO: remove all hooks
    await this.hooks.projectOptionsLoaded.promise(this.projectOptions);

    this.initializeProjectOptionsHooks();

    await this.hooks.configHooksLoaded.promise(this);

    // TODO: merge into scripts
    this.plugins.push({
      id: 'chisel-plugin-wordpress',
      apply: require('chisel-plugin-wordpress'),
    });

    await this.initializePlugins();
  }

  initializeProjectOptionsHooks() {
    const { hooks: optionsHooks } = this.projectOptions;
    if (!optionsHooks) return;

    const subscribe = (hooks, taps) => {
      Object.entries(taps).forEach(([name, tap]) => {
        const hook = hooks[name];

        if (hook instanceof AsyncSeriesHook) {
          hook.tapPromise('ChiselConfig', (...args) =>
            Promise.resolve(tap(...args)),
          );
        } else {
          throw new Error(`Don't know how to tap to ${name} hook`);
        }
      });
    };

    const hooksToSubscribe = Object.fromEntries(
      Object.entries(optionsHooks).filter(
        ([, value]) => typeof value === 'function',
      ),
    );

    const hooksFromPlugins = Object.fromEntries(
      Object.entries(optionsHooks).filter(
        ([, value]) => typeof value === 'object',
      ),
    );

    subscribe(this.hooks, hooksToSubscribe);

    if (Object.keys(hooksFromPlugins).length > 0) {
      this.hooks.pluginsInitialized.tap('Service', () => {
        Object.entries(hooksFromPlugins).forEach(([plugin, taps]) => {
          subscribe(this.hooks[plugin], taps);
        });
      });
    }
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
