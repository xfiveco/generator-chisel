const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO = 'xfiveco/chisel-ai-coding-ruleset';
const REF = 'master';
const VERSION_FILE = 'VERSION';
const LOCAL_VERSION_FILE = '.chisel-ai-ruleset-version';
const SKIP_PATTERNS = [/^readme(\.|$)/i, /^license(\.|$)/i, /^\.git/i];

const VERSION_URL = `https://raw.githubusercontent.com/${REPO}/${REF}/${VERSION_FILE}`;

const DEFAULT_OPTIONS = {
  headers: { 'User-Agent': 'Chisel-Generator-AI-Ruleset' },
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

async function downloadTree(remotePath, localPath) {
  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${remotePath}?ref=${REF}`;
  const items = await fetchJson(apiUrl);

  if (!Array.isArray(items)) {
    if (items.type === 'file') {
      await downloadFile(items.download_url, localPath);
    }
    return;
  }

  for (const item of items) {
    if (shouldSkip(item.name)) continue;

    const localItemPath = path.join(localPath, item.name);

    if (item.type === 'file') {
      console.log(`  📄 ${item.path}`);
      await downloadFile(item.download_url, localItemPath);
    } else if (item.type === 'dir') {
      await downloadTree(item.path, localItemPath);
    }
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
      await downloadTree('', themePath);

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
