import { relative, join } from 'path';
import fastGlob from 'fast-glob';
import fs from 'fs/promises';

const { convertPathToPattern } = fastGlob;

export const build = async (api) => {
  const stylesDir = api.resolve('src/styles');
  const pattern = join(stylesDir, '*/**/*.scss');
  const files = (await fastGlob(convertPathToPattern(pattern))).sort();

  const groups = files.sort().reduce((acc, file) => {
    const group = convertPathToPattern(relative(stylesDir, file)).split('/')[0];
    acc[group] = acc[group] || [];
    acc[group].push(file);
    return acc;
  }, {});

  for (const [group, files] of Object.entries(groups)) {
    const dir = join(stylesDir, group);
    const content = [
      '// stylelint-disable',
      '// This file is auto generated. Do not edit directly.',
      '',
      ...files
        .map((file) => {
          const finalPath = convertPathToPattern(relative(dir, file));
          if (finalPath === '_index.scss') return '';
          return `@use '${finalPath}';`;
        })
        .filter(Boolean),
      '',
    ].join('\n');

    await fs.writeFile(join(stylesDir, group, '_index.scss'), content);
  }
};

export const start = async (api) => {
  const { default: chokidar } = await import('chokidar');

  const stylesDir = api.resolve('src/styles');
  const pattern = join(stylesDir, '*/**/*.scss');

  const watcher = chokidar.watch(convertPathToPattern(pattern), {
    persistent: false,
    ignoreInitial: true,
  });
  watcher.on('add', () => build(api));
  watcher.on('unlink', () => build(api));
};
