var util = require('util');
var ProcessInstance = require('./ProcessInstance');

var gulpUrl = /Local: (http[^\s]+)/;

function GulpInstance() {
  ProcessInstance.call(this);

  this.localUrl = null;
}
util.inherits(GulpInstance, ProcessInstance);

GulpInstance.prototype.start = function() {
  var gulpProcess = this._start('gulp', [], {stdio: ['ignore', 'pipe', 'inherit']})

  var buffer = new Buffer([]);
  var gulpListener = (data) => {
    buffer = Buffer.concat([buffer, data]);
    var str = buffer.toString('utf8');
    if(str.indexOf('Finished \'default\'') != -1) {
      gulpProcess.stdout.removeListener('data', gulpListener);
      this.localUrl = gulpUrl.exec(str)[1];
      this.emit('ready');
    }
  }
  gulpProcess.stdout.on('data', (data) => process.stdout.write(data));
  gulpProcess.stdout.on('data', gulpListener);
}

GulpInstance.prototype.stop = ProcessInstance.prototype._stop;

module.exports = GulpInstance;
