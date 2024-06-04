let $hasYarn;
function hasYarn() {
  return false; // v2 is always using npm
  if ($hasYarn !== undefined) return $hasYarn;

  const commandExists = require('command-exists');
  $hasYarn = commandExists.sync('yarn');
  return $hasYarn;
}

module.exports.hasYarn = hasYarn;

function installDependencies(opts = {}) {
  const execa = require('execa');

  return execa(hasYarn() ? 'yarn' : 'npm', ['install'], {
    stdio: 'inherit',
    ...opts,
  });
}

module.exports.installDependencies = installDependencies;
