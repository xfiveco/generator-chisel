const updateNotifier = require('update-notifier');
const { chalk } = require('chisel-shared-utils');
const fs = require('fs-extra');
const pkg = require('../../../../package.json');

const CHECK_UPDATE_DIST_TAGS = pkg.version.includes('-')
  ? ['next', 'latest']
  : ['latest'];

module.exports = async (api) => {
  async function maybeContinue() {
    const { continue: cont } = await api.promptLocal([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Are you sure you want to continue?',
        default: false,
      },
    ]);

    if (!cont) {
      process.exit(1);
    }
  }

  api.schedule(api.PRIORITIES.HELLO, async () => {
    if (process.env.CHISEL_TEST) return;
    console.log();
    console.log(chalk.yellow('*'.repeat(47)));
    console.log();
    console.log(chalk.yellow('  Welcome to Chisel'));
    console.log();
    console.log(chalk.reset('  https://www.getchisel.co'));
    console.log(chalk.reset('  https://github.com/xfiveco/generator-chisel'));
    console.log();
    console.log(chalk.yellow('*'.repeat(47)));
    console.log();
  });

  api.schedule(api.PRIORITIES.CHECK_UPDATE, async () => {
    if (process.env.CHISEL_TEST) return;

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 5000),
    );

    try {
      const updates = await Promise.all(
        CHECK_UPDATE_DIST_TAGS.map(async (distTag) => {
          const notifier = updateNotifier({
            pkg,
            updateCheckInterval: Infinity,
            distTag,
          });

          const info = await Promise.race([notifier.fetchInfo(), timeout]);
          notifier.update = info;
          const hasUpdate =
            info.latest !== info.current && info.type !== distTag;

          return {
            notifier,
            info,
            hasUpdate,
          };
        }),
      );

      const firstUpdate = updates.find((update) => update.hasUpdate);

      if (firstUpdate) {
        firstUpdate.notifier.notify({ defer: false, isGlobal: true });

        await maybeContinue();
      }
    } catch (e) {
      console.error('Update check failed');
    }
  });

  api.schedule(api.PRIORITIES.CHECK_EXIST, async () => {
    if (await fs.pathExists(api.resolve('wp-config.php'))) {
      console.log('A Chisel project already exists in this folder.');
      console.log(
        'If you are trying to setup an existing project, check out the' +
          ' documentation at https://www.getchisel.co/docs/setup/',
      );
      console.log(
        'If the process of generating project was interrupted and you would' +
          ' like to continue, we recommend cleaning up the directory and' +
          ' starting again.',
      );

      await maybeContinue();
    }
  });
};
