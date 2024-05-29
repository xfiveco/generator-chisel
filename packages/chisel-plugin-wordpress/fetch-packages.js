const axios = require('axios');
const fs = require('fs');
const execa = require('execa');

(async () => {
  const {
    data: fileWpCli,
  } = await axios(
    'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar',
    { responseType: 'arraybuffer' },
  );
  fs.writeFileSync('./wp-cli.phar', fileWpCli);
  await execa('php', ['./wp-cli.phar', '--info']);

  const { data: fileComposer } = await axios(
    'https://getcomposer.org/download/latest-2.x/composer.phar',
    {
      responseType: 'arraybuffer',
    },
  );
  fs.writeFileSync('./composer.phar', fileComposer);
  await execa('php', ['./composer.phar', '--version']);
})().catch((err) => {
  console.error(String(err));
  process.exit(1);
});
