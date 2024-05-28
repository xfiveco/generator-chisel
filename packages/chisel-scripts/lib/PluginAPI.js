const path = require('path');
const tapable = require('tapable');

// Based on https://github.com/vuejs/vue-cli/blob/80b93951b1710733a66765cbd535b12b7bb59279/packages/%40vue/cli-service/lib/PluginAPI.js

module.exports = class PluginAPI {
  constructor(id, service) {
    this.id = id;
    /** @type import('./Service') */
    this.service = service;

    this.tapable = tapable;
  }

  get hooks() {
    return this.service.hooks;
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
    this.service.programCommands[command.name()] = command;

    command.action(fn);

    if (opts) {
      opts(command);
    }
  }

  // 2024 remove?
  registerHooks(scope, hooks = {}) {
    if (this.service.hooksFromPlugins[scope]) {
      throw new Error(`Hooks scope ${scope} is already registered`);
    }

    this.service.hooksFromPlugins[scope] = Object.freeze({ ...hooks });
    this.service.hooks = Object.freeze({
      ...this.service.hooksBase,
      ...this.service.hooksFromPlugins,
    });
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

  resolveRoot(..._path) {
    return this.resolve('../../..', ..._path);
  }
};
