const https = require('https');
const fs = require('fs');
const path = require('path');

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

const VERSION_URL = `https://raw.githubusercontent.com/${REPO}/${REF}/${VERSION_FILE}`;

const DEFAULT_OPTIONS = {
  headers: { 'User-Agent': 'Chisel-Generator-AI-Ruleset' },
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

module.exports = (api) => {
  if (api.creator.cmd.skipAiRuleset) return;

  api.schedule(api.PRIORITIES.PROMPT, async () => {
    await api.prompt([
      {
        type: 'confirm',
        name: 'install',
        message: 'Install AI coding ruleset?',
        default: true,
      },
    ]);
  });

  api.schedule(api.PRIORITIES.AI_RULESET, async () => {
    if (!api.creator.data.aiRuleset.install) return;

    const themePath = api.resolve(api.creator.data.app.themePath);

    console.log('\n📥 Downloading AI coding ruleset...');
    try {
      await downloadTree(themePath);

      let remoteVersion = null;
      try {
        remoteVersion = (await fetchText(VERSION_URL)).trim();
      } catch (err) {
        console.warn(
          `⚠️  Could not fetch VERSION file: ${err.message}. Skipping version marker.`,
        );
      }

      if (remoteVersion) {
        fs.writeFileSync(
          path.join(themePath, LOCAL_VERSION_FILE),
          `${remoteVersion}\n`,
        );
      }

      console.log('✔ AI coding ruleset installed');
    } catch (err) {
      console.error(`⚠️  Failed to install AI coding ruleset: ${err.message}`);
      if (err.message.includes('403')) {
        console.error('Note: This might be due to GitHub API rate limits.');
      }
    }
  });
};
