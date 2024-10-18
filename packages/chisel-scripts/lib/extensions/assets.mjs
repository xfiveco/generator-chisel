import { relative, join } from 'path';
import { relative as relativePosix } from 'path/posix';
import fastGlob from 'fast-glob';
import fs from 'fs/promises';
import { createHash } from 'crypto';
import json2php from 'json2php';

const { convertPathToPattern } = fastGlob;

const hashesCache = {};

export const build = async (api, { fromWatch = false } = {}) => {
  const assetsDir = api.resolve('assets');
  const assetsDirPattern = convertPathToPattern(assetsDir);
  const pattern = assetsDirPattern + '/**';
  const files = (
    await fastGlob(pattern, {
      onlyFiles: true,
      stats: true,
    })
  ).sort((a, b) => a.path.localeCompare(b.path));
  const hashesFile = join(assetsDir, 'hashes.php');
  const hashesFilePattern = convertPathToPattern(hashesFile);

  const hashes = {};

  for (const file of files) {
    if (file.path === hashesFilePattern) continue;

    const id = `${file.path}-${file.stats.size}-${file.stats.mtimeMs}`;
    const key = convertPathToPattern(relative(assetsDirPattern, file.path));

    if (fromWatch) {
      if (hashesCache[id]) {
        hashes[key] = hashesCache[id];
        continue;
      }
    }

    const content = await fs.readFile(file.path);
    const hash = createHash('md5').update(content).digest('hex');
    hashes[key] = hash;
    hashesCache[id] = hash;
  }

  const phpArray = json2php.make({ indent: '  ', linebreak: '\n' })(hashes);
  const content = `<?php return ${phpArray};\n`;
  await fs.writeFile(hashesFile, content);
};

export const start = async (api) => {
  const { default: chokidar } = await import('chokidar');

  const assetsDir = api.resolve('assets');
  const hashesFile = join(assetsDir, 'hashes.php');
  const pattern = convertPathToPattern(assetsDir);

  const watcher = chokidar.watch(pattern, {
    ignoreInitial: true,
    awaitWriteFinish: true,
  });
  watcher.on('add', () => build(api, { fromWatch: true }));
  watcher.on('unlink', () => build(api, { fromWatch: true }));
  watcher.on('change', (file) => {
    if (file === hashesFile) return;
    build(api, { fromWatch: true });
  });
};
