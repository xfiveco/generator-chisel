import fs from 'fs';
import chiselSharedUtils from 'chisel-shared-utils';
import { fetchJson, compareVersions } from './chisel-update.mjs';

const { run } = chiselSharedUtils;

const PACKAGE = '@xfive/chisel-ai-toolkit';
const LATEST_URL = `https://registry.npmjs.org/${PACKAGE.replace(
  '/',
  '%2F',
)}/latest`;

function readInstalledVersion(api) {
  const pkgPath = api.resolve('node_modules', PACKAGE, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version || null;
}

export default function aiToolkit(api) {
  api.registerCommand(
    'check-ai-toolkit-update',
    (command) =>
      command.description(
        'check if a new Chisel AI toolkit version is available',
      ),
    async () => {
      const localVersion = readInstalledVersion(api);

      if (!localVersion) {
        console.log(
          `ℹ️  Chisel AI toolkit not installed. Run \`npm i -D ${PACKAGE}\` to add it.`,
        );
        return;
      }

      console.log(`Local Chisel AI toolkit version: ${localVersion}`);

      try {
        const { version: remoteVersion } = await fetchJson(LATEST_URL);

        if (compareVersions(remoteVersion, localVersion) > 0) {
          console.log(
            `\n⬆️  Chisel AI toolkit update available: ${localVersion} → ${remoteVersion}`,
          );
          console.log(`Run 'npm run update-ai-toolkit' to update.`);
        } else {
          console.log(`✔ Chisel AI toolkit is up to date (${localVersion})`);
        }
      } catch (err) {
        console.warn(
          `⚠️  Chisel AI toolkit version check failed: ${err.message}`,
        );
      }
    },
  );

  api.registerCommand(
    'update-ai-toolkit',
    (command) =>
      command.description('update the Chisel AI toolkit to the latest version'),
    async () => {
      if (!readInstalledVersion(api)) {
        console.log(
          `ℹ️  Chisel AI toolkit not installed. Run \`npm i -D ${PACKAGE}\` to add it.`,
        );
        return;
      }

      console.log('🚀 Updating Chisel AI toolkit...\n');

      const { exitCode } = await run(
        ['npm', 'install', '--save-dev', `${PACKAGE}@latest`],
        { cwd: api.resolve(), reject: false, execaOpts: { stdio: 'inherit' } },
      );

      if (exitCode !== 0) {
        console.error('\n❌ Chisel AI toolkit update failed.');
        process.exit(exitCode);
      }

      console.log('\n✅ Chisel AI toolkit update completed!');
    },
  );
}
