var util = require('util');
var ProcessInstance = require('./ProcessInstance');

function PhpServerInstance() {
  ProcessInstance.call(this);

  this.localUrl = null;
}
util.inherits(PhpServerInstance, ProcessInstance);

PhpServerInstance.prototype.start = function() {
  this._start('php', ['-S', '127.0.0.1:8080', '-t', 'wp'],
    {stdio: ['ignore', 'inherit', 'inherit']});
}

PhpServerInstance.prototype.stop = ProcessInstance.prototype._stop;

module.exports = PhpServerInstance;
