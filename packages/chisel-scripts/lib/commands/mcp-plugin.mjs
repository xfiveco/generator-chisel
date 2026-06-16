import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from 'chisel-shared-utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REPO = 'xfiveco/xfive-mcp';
const REF = 'v2';
const PLUGIN_SLUG = 'xfive-mcp';
const PLUGIN_FILE = 'xfive-mcp.php';
const ZIP_URL = `https://github.com/${REPO}/archive/${REF}.zip`;
const HEADER_URL = `https://raw.githubusercontent.com/${REPO}/${REF}/${PLUGIN_FILE}`;

const DEFAULT_OPTIONS = {
  headers: { 'User-Agent': 'Chisel-MCP-Plugin-Script' },
};

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { ...DEFAULT_OPTIONS, ...options }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(request(res.headers.location, options));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status Code: ${res.statusCode} for ${url}`));
      }
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    });
    req.on('error', reject);
  });
}

async function fetchText(url) {
  const buffer = await request(url);
  return buffer.toString();
}

function extractVersion(contents) {
  const match = contents.match(/^[ \t/*#@]*Version:\s*(.+)$/im);
  return match ? match[1].trim() : null;
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }

  return 0;
}

function wpCli(args, options = {}) {
  const wpCliPath = path.resolve(__dirname, '..', '..', 'wp-cli.phar');
  return run(['php', wpCliPath, ...args], options);
}

async function readInstalledVersion(api) {
  try {
    const { stdout } = await wpCli(
      ['plugin', 'get', PLUGIN_SLUG, '--field=version'],
      { cwd: api.resolveRoot(), silent: true, reject: false },
    );
    const version = stdout.trim();
    return version || null;
  } catch {
    return null;
  }
}

export default function mcpPlugin(api) {
  api.registerCommand(
    'check-mcp-update',
    (command) =>
      command.description('check if a new Xfive MCP plugin version is available'),
    async () => {
      try {
        const localVersion = await readInstalledVersion(api);

        if (!localVersion) {
          console.log(
            '⚠️  Xfive MCP plugin not installed. Run `npm run update-mcp` to install.',
          );
          return;
        }

        console.log(`Local Xfive MCP version: ${localVersion}`);

        const remoteVersion = extractVersion(await fetchText(HEADER_URL));

        if (!remoteVersion) {
          console.log('⚠️  Could not fetch remote Xfive MCP version.');
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
        console.error('❌ Xfive MCP version check failed:', err.message);
        process.exit(1);
      }
    },
  );

  api.registerCommand(
    'update-mcp',
    (command) =>
      command.description('force-reinstall the Xfive MCP plugin from GitHub'),
    async () => {
      console.log('🚀 Updating Xfive MCP plugin...\n');

      const { exitCode } = await wpCli(
        ['plugin', 'install', ZIP_URL, '--force', '--activate'],
        { cwd: api.resolveRoot(), reject: false },
      );

      if (exitCode !== 0) {
        console.error('\n❌ Xfive MCP plugin update failed.');
        process.exit(exitCode);
      }

      console.log('\n✅ Xfive MCP plugin update completed!');
    },
  );
}
