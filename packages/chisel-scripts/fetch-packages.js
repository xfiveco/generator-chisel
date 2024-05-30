const fs = require('fs');
const { execa } = require('chisel-shared-utils');

const get = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(
        `Failed to fetch ${url} with ${res.statusText} (${res.status})`,
      );
    }

    return res.arrayBuffer();
  });

(async () => {
  const fileWpCli = await get(
    'https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar',
  );
  fs.writeFileSync('./wp-cli.phar', new Uint8Array(fileWpCli));
  await execa('php', ['./wp-cli.phar', '--info']);

  const fileComposer = await get(
    'https://getcomposer.org/download/latest-2.x/composer.phar',
  );
  fs.writeFileSync('./composer.phar', new Uint8Array(fileComposer));
  await execa('php', ['./composer.phar', '--version']);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
