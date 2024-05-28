const TinyQueue = require('tinyqueue');
const path = require('path');
const CreatorPluginAPI = require('./CreatorPluginAPI');

module.exports = class Creator {
  constructor(context, opts) {
    this.data = {
      chiselVersion: require('../../../package.json').version,
    };
    this.queue = new TinyQueue(
      [],
      (a, b) => a.priority - b.priority || a.index - b.index,
    );
    this.context = context || process.env.CHISEL_CONTEXT || process.cwd();
    this.args = opts.args;
    this.cmd = opts.cmd;
    this.index = 0;
  }

  schedule(priority, action) {
    if (typeof priority !== 'number') {
      throw new Error('priority must be a number');
    }

    // eslint-disable-next-line no-plusplus
    this.queue.push({ priority, index: this.index++, action });
  }

  async loadCreator(name) {
    const ppath = path.join(__dirname, 'creators', name);
    const init = require(ppath);
    return init(new CreatorPluginAPI(name, this));
  }

  async run() {
    while (this.queue.length) {
      const item = this.queue.pop();
      console.log(`Running action with priority ${item.priority}`);
      await item.action();
    }
  }
};
