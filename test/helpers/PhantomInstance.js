'use strict';

var phantom = require('phantomjs-prebuilt').path;
var path = require('path');
var util = require('util');
var JSONStream = require('json-stream');
var ProcessInstance = require('./ProcessInstance');

function PhantomInstance() {
  ProcessInstance.call(this);

  this.isRunning = false;
  this.jsonStream = null;
}
util.inherits(PhantomInstance, ProcessInstance);

PhantomInstance.prototype.start = function(url) {
  if(this.isRunning) {
    return;
  }
  this._start(phantom, [path.join(__dirname, 'phantom_logger.js'), url], {
    stdio: ['ignore', 'pipe', 'inherit']
  });
  this.process.stdout.on('data', (data) => process.stdout.write(data));
  this.isRunning = true;

  this._startJSONStream();
}

PhantomInstance.prototype._startJSONStream = function() {
  var jsonStream = this.jsonStream = JSONStream();
  jsonStream.on('data', this._jsonStreamData.bind(this));
  this.process.stdout.pipe(jsonStream);
}

PhantomInstance.prototype._jsonStreamData = function(data) {
  if(data.kind) {
    this.emit(data.kind, data);
    if(data.kind == 'bsNotify' && data.text == 'Connected to BrowserSync') {
      this.emit('bsConnected');
    }
  }
}

PhantomInstance.prototype.stop = ProcessInstance.prototype._stop;

module.exports = PhantomInstance;
