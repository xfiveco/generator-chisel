const cp = require('child_process');
const path = require('path');
const commandExists = require('command-exists').sync;

let node_modules = '';

function prepare() {
  if(node_modules) {
    return;
  }
  const oldCwd = process.cwd();
  const initialCwd = path.join(__dirname, '..');
  process.chdir(initialCwd);
  cp.execSync('mkdir -p generated_project');
  cp.execSync('node generate_package.js');
  process.chdir(path.join(initialCwd, 'generated_project'));
  cp.execSync('yarn --non-interactive', { stdio: 'inherit' });
  node_modules = path.join(process.cwd(), 'node_modules');
  process.chdir(oldCwd);
}

exports.linkOrInstallModules = () => {
  console.log(`Test directory: ${process.cwd()}`);
  if(!commandExists('ln')) {
    return;
  }

  if(!node_modules) {
    prepare();
  }

  cp.execSync(`ln -s '${node_modules}' node_modules`);

  return node_modules;
}
