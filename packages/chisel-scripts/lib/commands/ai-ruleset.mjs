import https from 'https';
import fs from 'fs';
import path from 'path';

const REPO = 'xfiveco/chisel-ai-coding-ruleset';
const REF = 'master';
const VERSION_FILE = 'VERSION';
const LOCAL_VERSION_FILE = '.chisel-ai-ruleset-version';
const SKIP_PATTERNS = [
  /^readme(\.|$)/i,
  /^license(\.|$)/i,
  /^\.git/i,
  /^version$/i,
];

const CLEAN_DIRS = ['ai'];

const VERSION_URL = `https://raw.githubusercontent.com/${REPO}/${REF}/${VERSION_FILE}`;

const DEFAULT_OPTIONS = {
  headers: { 'User-Agent': 'Chisel-AI-Ruleset-Script' },
};

const MAX_RETRIES = 4;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestOnce(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { ...DEFAULT_OPTIONS, ...options }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(requestOnce(res.headers.location, options));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        const err = new Error(`Status Code: ${res.statusCode} for ${url}`);
        err.statusCode = res.statusCode;
        return reject(err);
      }
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    });
    req.on('error', reject);
  });
}

function isRetryable(err) {
  if (err.statusCode) return err.statusCode >= 500 || err.statusCode === 429;
  return true; // network error (ECONNRESET, ETIMEDOUT, etc.)
}

async function request(url, options = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await requestOnce(url, options);
    } catch (err) {
      if (attempt >= MAX_RETRIES || !isRetryable(err)) throw err;
      const delay = 500 * 2 ** attempt;
      console.warn(`  ⏳ ${err.message} — retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
}

async function fetchText(url) {
  const buffer = await request(url);
  return buffer.toString();
}

async function fetchJson(url) {
  const buffer = await request(url);
  return JSON.parse(buffer.toString());
}

async function downloadFile(url, destPath) {
  const buffer = await request(url);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buffer);
}

function shouldSkip(name) {
  return SKIP_PATTERNS.some((re) => re.test(name));
}

function rawUrl(filePath) {
  const encoded = filePath.split('/').map(encodeURIComponent).join('/');
  return `https://raw.githubusercontent.com/${REPO}/${REF}/${encoded}`;
}

async function downloadTree(localPath) {
  // One REST call lists the whole tree; file contents come from
  // raw.githubusercontent.com, which doesn't count against the API rate limit.
  const treeUrl = `https://api.github.com/repos/${REPO}/git/trees/${REF}?recursive=1`;
  const { tree, truncated } = await fetchJson(treeUrl);

  if (truncated) {
    throw new Error('Repository tree is too large to list in a single request.');
  }

  for (const entry of tree) {
    if (entry.type !== 'blob') continue;
    if (entry.path.split('/').some((segment) => shouldSkip(segment))) continue;

    console.log(`  📄 ${entry.path}`);
    await downloadFile(rawUrl(entry.path), path.join(localPath, entry.path));
  }
}

function readLocalVersion(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8').trim() || null;
}

function writeLocalVersion(filePath, version) {
  fs.writeFileSync(filePath, `${version}\n`);
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

export default function aiRuleset(api) {
  api.registerCommand(
    'check-ai-ruleset-update',
    (command) =>
      command.description(
        'check if a new AI coding ruleset version is available',
      ),
    async () => {
      const localVersionPath = api.resolve(LOCAL_VERSION_FILE);

      try {
        const localVersion = readLocalVersion(localVersionPath);

        if (!localVersion) {
          console.log(
            '⚠️  AI ruleset not installed (no .chisel-ai-ruleset-version file). Run `npm run update-ai-ruleset` to install.',
          );
          return;
        }

        console.log(`Local AI ruleset version: ${localVersion}`);

        const remoteVersion = (await fetchText(VERSION_URL)).trim();

        if (!remoteVersion) {
          console.log('⚠️  Could not fetch remote AI ruleset version.');
          return;
        }

        if (compareVersions(remoteVersion, localVersion) > 0) {
          console.log(
            `\n⬆️  AI ruleset update available: ${localVersion} → ${remoteVersion}`,
          );
          console.log(`Run 'npm run update-ai-ruleset' to update.`);
        } else {
          console.log(`✔ AI ruleset is up to date (${localVersion})`);
        }
      } catch (err) {
        console.error('❌ AI ruleset version check failed:', err.message);
        process.exit(1);
      }
    },
  );

  api.registerCommand(
    'update-ai-ruleset',
    (command) =>
      command.description('download/update the AI coding ruleset files'),
    async () => {
      const localBasePath = api.resolve();
      const localVersionPath = api.resolve(LOCAL_VERSION_FILE);

      console.log('🚀 Updating AI coding ruleset...\n');

      try {
        for (const dir of CLEAN_DIRS) {
          const dirPath = api.resolve(dir);
          if (fs.existsSync(dirPath)) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`  🧹 Removed old ${dir}/`);
          }
        }

        await downloadTree(localBasePath);

        let remoteVersion = null;
        try {
          remoteVersion = (await fetchText(VERSION_URL)).trim();
        } catch (err) {
          console.warn(
            `⚠️  Could not fetch VERSION file: ${err.message}. Skipping version marker.`,
          );
        }

        if (remoteVersion) {
          writeLocalVersion(localVersionPath, remoteVersion);
          console.log(`\n✔ Version marker updated: ${remoteVersion}`);
        }

        console.log('\n✅ AI ruleset update completed!');
      } catch (err) {
        console.error('\n❌ AI ruleset update failed:', err.message);
        if (err.message.includes('403')) {
          console.error('Note: This might be due to GitHub API rate limits.');
        }
        process.exit(1);
      }
    },
  );
}
