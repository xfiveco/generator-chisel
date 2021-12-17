const axios = require('axios');
const fs = require('fs');
const execa = require('execa');

(async () => {
  const {
    data: file,
  } = await axios(
    'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar',
    { responseType: 'arraybuffer' },
  );
  fs.writeFileSync('./wp-cli.phar', file);
  await execa('php', ['./wp-cli.phar', '--info']);
})().catch((err) => {
  console.error(String(err));
  process.exit(1);
});
