// Based on:
// * https://github.com/vuejs/vue-cli/blob/1a0b59142aa8797810ca90705290d960a4ee6d1e/packages/%40vue/cli/lib/Generator.js#L225
// * https://github.com/vuejs/vue-cli/blob/1a0b59142aa8797810ca90705290d960a4ee6d1e/packages/%40vue/cli/lib/util/sortObject.js

function sortObject(obj, keyOrder, dontSortByUnicode) {
  if (!obj) return undefined;
  const res = {};

  if (keyOrder) {
    keyOrder.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        res[key] = obj[key];
        delete obj[key];
      }
    });
  }

  const keys = Object.keys(obj);

  if (!dontSortByUnicode) keys.sort();
  keys.forEach((key) => {
    res[key] = obj[key];
  });

  return res;
}

module.exports = function sortPackage(pkg) {
  pkg.dependencies = sortObject(pkg.dependencies);
  pkg.devDependencies = sortObject(pkg.devDependencies);
  pkg.scripts = sortObject(pkg.scripts, [
    'dev',
    'watch',
    'build',
    'build-report',
    'lint',
    'wp',
  ]);
  pkg = sortObject(pkg, [
    'name',
    'version',
    'private',
    'license',
    'description',
    'author',
    'scripts',
    'main',
    'module',
    'browser',
    'jsDelivr',
    'unpkg',
    'files',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'engines',
    'vue',
    'babel',
    'eslintConfig',
    'prettier',
    'postcss',
    'browserslist',
    'jest',
  ]);

  return pkg;
};
