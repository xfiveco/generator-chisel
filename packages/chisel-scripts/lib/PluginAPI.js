const path = require('path');

// Based on https://github.com/vuejs/vue-cli/blob/80b93951b1710733a66765cbd535b12b7bb59279/packages/%40vue/cli-service/lib/PluginAPI.js

module.exports = class PluginAPI {
  constructor(id, service) {
    this.id = id;
    /** @type import('./Service') */
    this.service = service;
  }

  /**
   * Register a command that will become available as `chisel-scripts [name]`.
   *
   * @param {string} name
   * @param {object} [opts]
   * @param {function} fn
   *   (args: { [string]: string }, rawArgs: string[]) => ?Promise
   */
  registerCommand(name, opts, fn) {
    if (!fn) {
      fn = opts;
      opts = null;
    }

    const command = this.service.program.command(name);

    command.action(fn);

    if (opts) {
      opts(command);
    }
  }

  /**
   * Register a function that will receive a chainable webpack config
   * the function is lazy and won't be called until `resolveWebpackConfig` is
   * called
   *
   * @param {function} fn
   */
  chainWebpack(fn) {
    this.service.webpackChainFns.push(fn);
  }

  /**
   * Register
   * - a webpack configuration object that will be merged into the config
   * OR
   * - a function that will receive the raw webpack config.
   *   the function can either mutate the config directly or return an object
   *   that will be merged into the config.
   *
   * @param {object | function} fn
   */
  configureWebpack(fn) {
    this.service.webpackRawConfigFns.push(fn);
  }

  /**
   * Resolve path for a project.
   *
   * @param {string} _path - Relative path from project root
   * @return {string} The resolved absolute path.
   */
  resolve(..._path) {
    return path.resolve(this.service.context, ..._path.filter(Boolean));
  }
};
