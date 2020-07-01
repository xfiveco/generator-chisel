const globby = require('globby');
const path = require('path');
const prettier = require('prettier');
const fs = require('fs');

const files = globby
  .sync(path.join(__dirname, '../packages/*/package.json').replace(/\\/g, '/'))
  .sort();

const packagesVersions = Object.fromEntries(
  files.map((file) => {
    const pack = require(file);
    return [pack.name, pack.version];
  }),
);

let packagesVersionsString = `module.exports = ${JSON.stringify(
  packagesVersions,
)}`;

packagesVersionsString = prettier.format(packagesVersionsString, {
  ...prettier.resolveConfig.sync(__filename),
  filepath: __filename,
});

fs.writeFileSync(
  path.join(
    __dirname,
    '../packages/generator-chisel/lib/commands/create/packages-versions.js',
  ),
  packagesVersionsString,
);
