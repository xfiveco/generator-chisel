const fs = require('fs-extra');
const path = require('path');

const initialDir = process.cwd();

beforeEach(() => {
  const now = new Date().toISOString().replace(/[^\w\d]/g, '');
  const dir = path.resolve(initialDir, '.jest-projects', now);
  fs.mkdirpSync(dir);
  process.chdir(dir);
});

afterEach(async () => {
  const currentPwd = process.cwd();
  process.chdir(initialDir);
  if (currentPwd.includes('.jest-projects')) {
    // console.log('REMOVE SYNC', new Date().toISOString());
    // await fs.remove(currentPwd);
    await fs.remove(currentPwd);
  }
});

const supportsPuppeteer = process.version !== 'v10.14.2';
describe.supportsPuppeteer = supportsPuppeteer ? describe : describe.skip;
test.supportsPuppeteer = supportsPuppeteer ? test : test.skip;
it.supportsPuppeteer = supportsPuppeteer ? it : it.skip;
