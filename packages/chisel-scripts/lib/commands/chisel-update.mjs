import https from 'https';
import fs from 'fs';
import path from 'path';

// GitHub repository configuration
const REPO = 'xfiveco/generator-chisel';
const REF = 'v2';
const THEME_PATH =
  'packages/generator-chisel/lib/commands/create/creators/app/chisel-starter-theme';

// URLs
const STYLE_REMOTE_PATH = `${THEME_PATH}/style.chisel-tpl.css`;
const STYLE_URL = `https://raw.githubusercontent.com/${REPO}/${REF}/${STYLE_REMOTE_PATH}`;

/**
 * List of paths to update from the Chisel repository.
 * Can be folders or files.
 */
const PATHS_TO_UPDATE = [
  'core',
  // Add more folders/files here in the future
];

// Map of remote names to local names if they differ
const NAME_MAPPING = {
  'style.chisel-tpl.css': 'style.css',
};

const DEFAULT_OPTIONS = {
  headers: {
    'User-Agent': 'Chisel-Update-Script',
  },
};

const VERSION_REGEX = /(Version:\s*)([0-9]+\.[0-9]+\.[0-9]+)/i;

// ============================================================================
// HTTP Utilities
// ============================================================================

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

async function fetchJson(url) {
  const buffer = await request(url);
  return JSON.parse(buffer.toString());
}

// ============================================================================
// Version Utilities
// ============================================================================

function extractVersion(css) {
  const match = css.match(VERSION_REGEX);
  return match ? match[2] : null;
}

function readLocalVersion(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return extractVersion(fs.readFileSync(filePath, 'utf8'));
}

function updateLocalVersion(filePath, newVersion) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (!VERSION_REGEX.test(content)) {
    console.error(`Version pattern not found in: ${filePath}`);
    return false;
  }

  const updatedContent = content.replace(VERSION_REGEX, `$1${newVersion}`);
  fs.writeFileSync(filePath, updatedContent);
  return true;
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

// ============================================================================
// Update Functions
// ============================================================================

async function downloadFile(url, destPath) {
  const buffer = await request(url);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buffer);
}

async function updateFolder(remoteFolderPath, localFolderPath) {
  console.log(`📂 Updating folder: ${path.basename(remoteFolderPath)}`);

  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${remoteFolderPath}?ref=${REF}`;
  let items;

  try {
    items = await fetchJson(apiUrl);
  } catch (err) {
    if (err.message.includes('404')) {
      console.warn(`⚠️  Remote folder not found: ${remoteFolderPath}`);
      return;
    }
    throw err;
  }

  if (!Array.isArray(items)) {
    if (items.type === 'file') {
      await downloadFile(items.download_url, localFolderPath);
      return;
    }
    throw new Error(
      `Expected array of items from GitHub API, got: ${typeof items}`,
    );
  }

  for (const item of items) {
    const localItemPath = path.join(localFolderPath, item.name);

    if (item.type === 'file') {
      console.log(`  📄 ${item.name}`);
      await downloadFile(item.download_url, localItemPath);
    } else if (item.type === 'dir') {
      await updateFolder(item.path, localItemPath);
    }
  }
}

async function updateFile(remotePath, localPath) {
  console.log(`  📄 Updating file: ${path.basename(remotePath)}`);
  const downloadUrl = `https://raw.githubusercontent.com/${REPO}/${REF}/${remotePath}`;
  await downloadFile(downloadUrl, localPath);
}

async function syncStyleVersion(localStylePath) {
  console.log('\n📋 Syncing style.css version...');

  const localVersion = readLocalVersion(localStylePath);
  const remoteCss = await fetchText(STYLE_URL);
  const remoteVersion = extractVersion(remoteCss);

  if (!remoteVersion) {
    console.warn('⚠️  Could not fetch remote version.');
    return;
  }

  if (!localVersion) {
    console.warn('⚠️  Local version not found in style.css.');
    return;
  }

  if (compareVersions(remoteVersion, localVersion) > 0) {
    if (updateLocalVersion(localStylePath, remoteVersion)) {
      console.log(`  ✔ Version updated: ${localVersion} → ${remoteVersion}`);
    }
  } else {
    console.log(`  ✔ Version is already up to date (${localVersion})`);
  }
}

// ============================================================================
// Command Registration
// ============================================================================

export default function chiselUpdate(api) {
  api.registerCommand(
    'check-chisel-update',
    (command) =>
      command.description('check if a new Chisel version is available'),
    async () => {
      const localStylePath = api.resolve('style.css');

      try {
        const localVersion = readLocalVersion(localStylePath);

        if (!localVersion) {
          console.log(
            '⚠️  Local version not found. Consider running `chisel-scripts update`.',
          );
          return;
        }

        console.log(`Local version: ${localVersion}`);

        const remoteCss = await fetchText(STYLE_URL);
        const remoteVersion = extractVersion(remoteCss);

        if (!remoteVersion) {
          console.log('⚠️  Could not fetch remote version.');
          return;
        }

        if (compareVersions(remoteVersion, localVersion) > 0) {
          console.log(
            `\n⬆️  Update available: ${localVersion} → ${remoteVersion}`,
          );
          console.log(`Run 'chisel-scripts update' to update.`);
        } else {
          console.log(`✔ Chisel is up to date (${localVersion})`);
        }
      } catch (err) {
        console.error('❌ Version check failed:', err.message);
        process.exit(1);
      }
    },
  );

  api.registerCommand(
    'chisel-update',
    (command) =>
      command
        .description('update Chisel core files from the repository')
        .option('--skip-version-sync', 'skip syncing version in style.css'),
    async (options) => {
      const localBasePath = api.resolve();
      const localStylePath = api.resolve('style.css');

      console.log('🚀 Starting Chisel update...\n');

      try {
        // Update configured paths
        for (const item of PATHS_TO_UPDATE) {
          const remotePath = `${THEME_PATH}/${item}`;
          const localName = NAME_MAPPING[item] || item;
          const localPath = path.join(localBasePath, localName);

          if (item.includes('.')) {
            await updateFile(remotePath, localPath);
          } else {
            await updateFolder(remotePath, localPath);
          }
        }

        // Sync version in style.css
        if (!options.skipVersionSync) {
          await syncStyleVersion(localStylePath);
        }

        console.log('\n✅ Update completed successfully!');
        console.log(
          'Note: Local files that do not exist in the repository (e.g., custom files) were preserved.',
        );
      } catch (err) {
        console.error('\n❌ Update failed:', err.message);
        if (err.message.includes('403')) {
          console.error('Note: This might be due to GitHub API rate limits.');
        }
        process.exit(1);
      }
    },
  );
}
