var EventEmitter = require('events');
var util = require('util');
var spawn = require('cross-spawn');

function ProcessInstance() {
  EventEmitter.call(this);

  this.process = null;
}
util.inherits(ProcessInstance, EventEmitter);

ProcessInstance.prototype._start = function(name, args, options) {
  this.process = spawn(name, args, options);
  return this.process;
}

ProcessInstance.prototype._stop = function(cb) {
  cb = cb || function() {};
  if(!this.process) {
    cb('Not started');
    return;
  }
  if(cb) {
    this.process.once('close', cb);
  }
  this.process.once('close', () => this.emit('stop'));
  this.process.kill();
}

module.exports = ProcessInstance;
