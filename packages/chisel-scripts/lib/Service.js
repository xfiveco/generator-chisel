// Based on https://github.com/vuejs/vue-cli/blob/80b93951b1710733a66765cbd535b12b7bb59279/packages/%40vue/cli-service/lib/Service.js

// const merge = require('webpack-merge');
const Config = require('webpack-chain');
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
      './commands/inspect',
      // config plugins are order sensitive
      './config/base',
      './config/js',
      './config/css',
      // './config/prod',
    ];

    const plugins = [];

    plugins.push(...builtInPlugins.map(idToPlugin));

    return plugins;
  }

  async initializePlugins() {
    for (const { id, apply } of this.plugins) {
      await apply(new PluginAPI(id, this), this.projectOptions);
    }
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    this.program.version(require('../package.json').version);

    const baseOptions = require('./chisel.config.base.js');
    const userOptions = require(path.resolve(this.context, 'chisel.config.js'));
    let userLocalOptions = {};
    try {
      userLocalOptions = require(path.resolve(
        this.context,
        'chisel.config.local.js',
      ));
    } catch (e) {
      //
    }
    this.projectOptions = defaultsDeep(
      {},
      userLocalOptions,
      userOptions,
      baseOptions,
    );

    if (Array.isArray(userOptions.plugins)) {
      userOptions.plugins.forEach((plugin, index) => {
        if (typeof plugin === 'string') {
          this.plugins.push({ id: plugin, apply: require(plugin) });
        } else if (typeof plugin === 'function') {
          this.plugins.push({
            id: plugin.name || `plugin${index}`,
            apply: plugin,
          });
        }
      });
    }

    await this.initializePlugins();
  }

  async run(name, args = []) {
    await this.init();

    const commanderArgs = [...(name ? [name] : []), ...args];

    return this.program.parseAsync(commanderArgs, { from: 'user' });
  }

  async resolveChainableWebpackConfig() {
    const chainableConfig = new Config();
    for (const fn of this.webpackChainFns) {
      await fn(chainableConfig);
    }
    return chainableConfig;
  }

  async resolveWebpackConfig(chainableConfig) {
    if (!chainableConfig) {
      chainableConfig = await this.resolveChainableWebpackConfig();
    }
    // get raw config
    const config = chainableConfig.toConfig();
    // const original = config

    config.node = false;
    // apply raw config fns
    // this.webpackRawConfigFns.forEach(fn => {
    //   if (typeof fn === 'function') {
    //     // function with optional return value
    //     const res = fn(config)
    //     if (res) config = merge(config, res)
    //   } else if (fn) {
    //     // merge literal values
    //     config = merge(config, fn)
    //   }
    // })
    //
    // #2206 If config is merged by merge-webpack, it discards the __ruleNames
    // information injected by webpack-chain. Restore the info so that
    // vue inspect works properly.
    // if (config !== original) {
    //   cloneRuleNames(
    //     config.module && config.module.rules,
    //     original.module && original.module.rules
    //   )
    // }
    return config;
  }
};
