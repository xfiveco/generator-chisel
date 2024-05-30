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
    this.service.programCommands[command.name()] = command;

    command.action(fn);

    if (opts) {
      opts(command);
    }
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
