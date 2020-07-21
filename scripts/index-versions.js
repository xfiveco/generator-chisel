const globby = require('globby');
const path = require('path');
const prettier = require('prettier');
const fs = require('fs-extra');
const conventionalChangelog = require('conventional-changelog');
const streamToPromise = require('stream-to-promise');
const { Changelog } = require('lerna-changelog');
const { load: loadConfig } = require('lerna-changelog/lib/configuration.js');
const oldVersions = require('../packages/generator-chisel/lib/commands/create/packages-versions.js');

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

// Copy readme so it's included in generator-chisel package
fs.copySync('./README.md', './packages/generator-chisel/README.md');

Object.entries(oldVersions).map(async ([name, version]) => {
  if (packagesVersions[name] === version) return;

  const packageDir = path.resolve(__dirname, `../packages/${name}`);

  const stream = conventionalChangelog(
    {
      pkg: { path: packageDir },
      tagPrefix: `${name}@`,
    },
    undefined,
    { path: `packages/${name}` },
  );
  const data = (await streamToPromise(stream)).toString('utf8');
  const changelogFile = path.join(packageDir, 'CHANGELOG.md');

  const changelog = await fs.readFile(changelogFile, 'utf8');

  const changelogNew = changelog.replace(
    '<!-- INSERT-NEW-ENTRIES-HERE -->',
    `<!-- INSERT-NEW-ENTRIES-HERE -->\n${data}`,
  );

  const changelogFormatted = prettier.format(changelogNew, {
    ...prettier.resolveConfig.sync(changelogFile),
    filepath: __filename,
    parser: 'markdown',
  });

  await fs.writeFile(changelogFile, changelogFormatted);
});

// TODO: Not Well Tested
if (packagesVersions['generator-chisel'] !== oldVersions['generator-chisel']) {
  (async () => {
    const config = loadConfig({
      nextVersion: `v${packagesVersions['generator-chisel']}`,
    });

    const options = {
      tagFrom:
        process.env.LENRA_TAG_FROM ||
        `generator-chisel@${oldVersions['generator-chisel']}`,
    };

    const data = await new Changelog(config).createMarkdown(options);
    const changelogFile = path.join(__dirname, '../CHANGELOG.md');
    const currentChangelog = await fs.readFile(changelogFile, 'utf8');

    const changelogNew = currentChangelog.replace(
      '<!-- INSERT-NEW-ENTRIES-HERE -->',
      `<!-- INSERT-NEW-ENTRIES-HERE -->\n${data}`,
    );

    const changelogFormatted = prettier.format(changelogNew, {
      ...prettier.resolveConfig.sync(changelogFile),
      filepath: __filename,
      parser: 'markdown',
    });

    await fs.writeFile(changelogFile, changelogFormatted);
    await fs.writeFile(
      path.join(__dirname, '../packages/generator-chisel/CHANGELOG-CHISEL.md'),
      changelogFormatted,
    );
  })();
}

process.on('unhandledRejection', (reason) => {
  console.log('Unhandled Rejection');
  console.log(reason);
  process.exit(1);
});
