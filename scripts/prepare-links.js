const globby = require('globby');
const path = require('path');
const execa = require('execa');

const dirs = globby
  .sync(path.join(__dirname, '../packages/*').replace(/\\/g, '/'), {
    onlyDirectories: true,
  })
  .sort();

dirs.forEach((dir) => {
  console.log(`Running yarn link in ${dir}`);
  execa.sync('yarn', ['link'], { cwd: dir, stdio: 'inherit' });
  console.log();
});
