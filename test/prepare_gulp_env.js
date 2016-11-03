var cp = require('child_process');
var path = require('path');

var node_modules = '';

exports.prepare = function() {
  if(process.env.CHISEL_MODULES || node_modules) {
    return;
  }
  var initialCwd = path.join(__dirname, '..');
  process.chdir(initialCwd);
  cp.execSync('npm install gulp-cli ejs');
  process.chdir(path.join(initialCwd, 'test'));
  cp.execSync('mkdir -p generated_project');
  cp.execSync('node generate_package.js');
  process.chdir(path.join(initialCwd, 'test/generated_project'));
  cp.execSync('npm install');
  node_modules = path.join(process.cwd(), 'node_modules');
  process.chdir(initialCwd);
}

exports.getNodeModules = function() {
  if(process.env.CHISEL_MODULES) {
    return process.env.CHISEL_MODULES;
  }
  return node_modules;
}
