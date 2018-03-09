'use strict';

var cp = require('child_process');
var path = require('path');
var fs = require('fs');
const EXIT_CODE_SUCCESS = 0;

function getWpCliPath() {
  return path.join(__dirname, 'wp-cli.phar');
}

function getDefaultArgs() {
  const path = fs.existsSync('web') ? 'web' : 'wp';
  return [getWpCliPath(), '--path='+path, '--color'];
}

function parseParams(params) {
  var args = [];
  Object.keys(params).forEach((key) => {
    var val = params[key];
    if(typeof val == 'boolean') {
      args.push('--'+key);
    } else {
      args.push('--'+key+'='+val);
    }
  });
  return args;
}

module.exports = function runCommand(args, opts, cb) {
  if(typeof opts == 'function') {
    cb = opts;
    opts = {};
  }
  for(let i = 0; i < args.length; i++) {
    if(typeof args[i] == 'object') {
      let parsed = parseParams(args[i]);
      args.splice.apply(args, [i, 1].concat(parsed));
      i += parsed.length-1;
    }
  }
  args = [].concat(getDefaultArgs(), args);

  var stdout = [], stderr = [];
  var proc = cp.spawn('php', args, {stdio: ['inherit', 'pipe', 'pipe']});

  proc.stdout.on('data',
    (data) => (stdout.push(data) && !opts.hideStdio && process.stdout.write(data)));
  proc.stderr.on('data',
    (data) => (stderr.push(data) && !opts.hideStdio && process.stderr.write(data)));

  proc.on('close', (code) =>
    cb((code === EXIT_CODE_SUCCESS ? null : code), [Buffer.concat(stdout), Buffer.concat(stderr)]));

}
