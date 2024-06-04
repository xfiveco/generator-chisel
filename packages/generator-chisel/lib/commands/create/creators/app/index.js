const path = require('path');
const { startCase } = require('lodash');
const speakingUrl = require('speakingurl');
const {
  execa,
  run,
  runLocal,
  installDependencies,
} = require('chisel-shared-utils');
const packagesVersions = require('../../packages-versions');

module.exports = async (api) => {
  let app;

  const runLocalCurrent = (args, opts) =>
    runLocal(args, { ...opts, cwd: api.resolve(app.themePath) });

  api.schedule(api.PRIORITIES.PROMPT, async () => {
    const userName = execa('git', ['config', 'user.name'], {
      timeout: 2000,
    }).catch(() => ({}));

    app = await api.prompt([
      {
        name: 'name',
        message: 'Please enter the project name:',
        default: () => startCase(path.basename(process.cwd())),
        validate: (val) => Boolean(val),
      },
      {
        name: 'author',
        message: 'Please enter author name:',
        default: async () => (await userName).stdout,
      },
    ]);

    app.nameSlug = speakingUrl(app.name)
      .replace(/(?<=[^\d])-(\d+)/g, (_, d) => d)
      .replace(/[^a-z0-9-]/g, '-');
    // app.nameCamel = camelCase(app.nameSlug);
    app.hasJQuery = false;
    app.themeName = `${app.nameSlug}-chisel`;
    app.themePath = `wp-content/themes/${app.themeName}`;

    await api.creator.loadCreator('wp');
  });

  // For linking we need to first install packages from npm registry and then
  // link local ones, if we don't do this yarn won't create proper entries in
  // node_modules/.bin and chisel-scripts command won't work
  let installedPackages;
  api.schedule(api.PRIORITIES.COPY, async () => {
    await api.copy();
    await api.copy({ from: 'chisel-starter-theme', to: app.themePath });

    const modifyDependencies = (deps) => {
      Object.keys(deps).forEach((dep) => {
        if (!packagesVersions[dep]) return;

        deps[dep] = `^${packagesVersions[dep]}`;
      });
    };

    await api.modifyFile(`${app.themePath}/package.json`, (body) => {
      installedPackages = [
        ...Object.keys(body.dependencies),
        ...Object.keys(body.devDependencies),
      ];

      modifyDependencies(body.dependencies);
      modifyDependencies(body.devDependencies);
    });
  });

  api.schedule(api.PRIORITIES.INSTALL_DEPENDENCIES, async () => {
    if (api.creator.cmd.skipDependenciesInstall) return;

    await installDependencies({ cwd: api.resolve(app.themePath) });

    // await run(['xfive-coding-standards', '--skip-staged-check'], {
    //   cwd: api.resolve(app.themePath),
    // });

    await run(
      ['npx', '--yes', '@xfive/coding-standards@latest', '--skip-staged-check'],
      { cwd: api.resolve(app.themePath) },
    );

    if (api.creator.cmd.link) {
      const availablePackages = Object.keys(packagesVersions);
      const installedAndAvailable = installedPackages.filter((pkg) =>
        availablePackages.includes(pkg),
      );

      for (const pkg of installedAndAvailable) {
        console.log(`Running npm link ${pkg}...`);
        await run(['npm', 'link', pkg], { cwd: api.resolve(app.themePath) });
      }
    }
  });

  // formatting done during coding standards installation but we may do extra for php and twig
  // api.schedule(api.PRIORITIES.FORMAT, async () => {
  //   if (api.creator.cmd.skipFormatAndBuild) return;

  //   // console.log('Formatting code...');
  //   // console.log('TODO');
  //   // await runLocalCurrent(['chisel-scripts', 'lint'], { silent: true });
  // });

  api.schedule(api.PRIORITIES.BUILD, async () => {
    if (api.creator.cmd.skipFormatAndBuild) return;

    console.log('Building...');
    await runLocalCurrent(['chisel-scripts', 'build'], {
      execaOpts: { stdio: 'inherit' },
    });
  });

  // api.schedule(api.PRIORITIES.END_MESSAGE, async () => {
  //   console.log('')
  // });
};
