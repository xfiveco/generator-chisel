import chiselSharedUtils from 'chisel-shared-utils';
import { join } from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

const { runLocalWithExit } = chiselSharedUtils;

function loadExtensions() {
  const extensionsDir = join(import.meta.dirname, '..', 'extensions');
  const files = fs
    .readdirSync(join(extensionsDir))
    .filter((file) => file.endsWith('.mjs'))
    .sort();

  return Promise.all(
    files.map((file) => import(pathToFileURL(join(extensionsDir, file)))),
  );
}

export default function wpScripts(api) {
  api.registerCommand(
    'build',
    (command) => command.description('build for production')
    .option(
      '--experimental-modules',
      'do not enable experimental modules',
    ),
    async (options) => {
      process.env.NODE_ENV = 'production';

      for (const extension of await loadExtensions()) {
        if (!extension.build) continue;

        await extension.build(api);
      }

      const args = ['wp-scripts', 'build'];

      if (options.experimentalModules) { // Disabled by default. Enable with `--experimental-modules`.
        args.push('--experimental-modules');
      }

      await runLocalWithExit(args, {
        cwd: api.resolve(),
      });
    },
  );

  api.registerCommand(
    'start',
    (command) => command.description('start development server')
    .option(
      '--experimental-modules',
      'do not enable experimental modules',
    ),
    async (options) => {
      process.env.NODE_ENV = 'development';

      const extensions = await loadExtensions();

      for (const extension of extensions) {
        if (!extension.build) continue;

        await extension.build(api);
      }

      for (const extension of extensions) {
        if (!extension.start) continue;

        await extension.start(api);
      }

      const args = ['wp-scripts', 'start', '--hot'];

      if (options.experimentalModules) { // Disabled by default. Enable with `--experimental-modules`.
        args.push('--experimental-modules');
      }

      await runLocalWithExit(args, {
        cwd: api.resolve(),
      });
    },
  );
}
