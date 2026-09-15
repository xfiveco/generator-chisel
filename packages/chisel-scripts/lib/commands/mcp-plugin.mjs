import path from 'path';
import { fileURLToPath } from 'url';
import chiselSharedUtils from 'chisel-shared-utils';
import {
  fetchText,
  extractVersion,
  readLocalVersion,
  compareVersions,
} from './chisel-update.mjs';

const { run } = chiselSharedUtils;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REPO = 'xfiveco/xfive-mcp';
const REF = 'main';
const PLUGIN_SLUG = 'xfive-mcp';
const PLUGIN_FILE = 'xfive-mcp.php';
const ZIP_URL = `https://github.com/${REPO}/archive/refs/heads/${REF}.zip`;
const HEADER_URL = `https://raw.githubusercontent.com/${REPO}/${REF}/${PLUGIN_FILE}`;

const localPluginFile = (api) =>
  api.resolveRoot('wp-content/plugins', PLUGIN_SLUG, PLUGIN_FILE);

export default function mcpPlugin(api) {
  api.registerCommand(
    'check-mcp-update',
    (command) =>
      command.description(
        'check if a new Xfive MCP plugin version is available',
      ),
    async () => {
      const localVersion = readLocalVersion(localPluginFile(api));

      if (!localVersion) {
        console.log('ℹ️  Xfive MCP plugin not installed.');
        return;
      }

      console.log(`Local Xfive MCP version: ${localVersion}`);

      try {
        const remoteVersion = extractVersion(await fetchText(HEADER_URL));

        if (!remoteVersion) {
          console.warn('⚠️  Could not read remote Xfive MCP version.');
          return;
        }

        if (compareVersions(remoteVersion, localVersion) > 0) {
          console.log(
            `\n⬆️  Xfive MCP update available: ${localVersion} → ${remoteVersion}`,
          );
          console.log(`Run 'npm run update-mcp' to update.`);
        } else {
          console.log(`✔ Xfive MCP plugin is up to date (${localVersion})`);
        }
      } catch (err) {
        console.warn(`⚠️  Xfive MCP version check failed: ${err.message}`);
      }
    },
  );

  api.registerCommand(
    'update-mcp',
    (command) =>
      command.description('reinstall the Xfive MCP plugin from GitHub'),
    async () => {
      if (!readLocalVersion(localPluginFile(api))) {
        console.log('ℹ️  Xfive MCP plugin not installed.');
        return;
      }

      console.log('🚀 Updating Xfive MCP plugin...\n');

      const wpCliPath = path.resolve(__dirname, '../..', 'wp-cli.phar');
      const { exitCode } = await run(
        [
          'php',
          wpCliPath,
          'plugin',
          'install',
          ZIP_URL,
          { force: true, activate: true },
        ],
        {
          cwd: api.resolveRoot(),
          reject: false,
          execaOpts: { stdio: 'inherit' },
        },
      );

      if (exitCode !== 0) {
        console.error('\n❌ Xfive MCP plugin update failed.');
        process.exit(exitCode);
      }

      console.log('\n✅ Xfive MCP plugin update completed!');
    },
  );
}
