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
    (command) => command.description('build for production'),
    // .option(
    //   '--no-clean',
    //   'do not remove the dist directory before building the project',
    // )
    // .option('--watch', 'watch for changes')
    // .option('--report', 'generate report to help analyze bundles content')
    async () => {
      process.env.NODE_ENV = 'production';

      for (const extension of await loadExtensions()) {
        if (!extension.build) continue;

        await extension.build(api);
      }

      await runLocalWithExit(['wp-scripts', 'build'], {
        cwd: api.resolve(),
      });
    },
  );

  api.registerCommand(
    'start',
    (command) => command.description('start development server'),
    async () => {
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

      await runLocalWithExit(['wp-scripts', 'start', '--hot'], {
        cwd: api.resolve(),
      });
    },
  );
}
