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
  const runLocalCurrent = (args, opts) =>
    runLocal(args, { ...opts, cwd: api.resolve() });

  api.schedule(api.PRIORITIES.PROMPT, async () => {
    // TODO: project exisits

    const userName = execa('git', ['config', 'user.name'], {
      timeout: 2000,
    }).catch(() => ({}));

    const app = await api.prompt([
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
      {
        type: 'list',
        name: 'projectType',
        message: 'Please select project type:',
        choices: [
          {
            name: 'WordPress Website',
            value: 'wp-with-fe',
          },
          {
            name: 'Static Website',
            value: 'fe',
          },
        ],
      },
      {
        type: 'checkbox',
        name: 'browsers',
        message: 'Which browsers are you supporting?',
        choices: [
          {
            name: 'Modern (3 recent versions of popular browsers)',
            short: 'Modern',
            value: 'modern',
            checked: true,
          },
          {
            name: 'Edge 18 (last Edge version before engine change)',
            short: 'Edge 18',
            value: 'edge18',
            checked: true,
          },
          {
            name: 'Internet Explorer 11',
            value: 'ie11',
          },
        ],
      },
    ]);

    const { projectType } = app;

    app.nameSlug = speakingUrl(app.name)
      .replace(/(?<=[^\d])-(\d+)/g, (_, d) => d)
      .replace(/[^a-z0-9-]/g, '-');
    // app.nameCamel = camelCase(app.nameSlug);
    app.hasJQuery = false;

    if (projectType === 'wp-with-fe') {
      await api.creator.loadCreator('wp');
    } else if (projectType === 'fe') {
      await api.creator.loadCreator('fe');
    }
  });

  // For linking we need to first install packages from npm registry and then
  // link local ones, if we don't do this yarn won't create proper entries in
  // node_modules/.bin and chisel-scripts command won't work
  let installedPackages;
  api.schedule(api.PRIORITIES.COPY, async () => {
    await api.copy();

    const modifyDependencies = (deps) => {
      Object.keys(deps).forEach((dep) => {
        if (!packagesVersions[dep]) return;
        deps[dep] = `^${packagesVersions[dep]}`;
      });
    };

    await api.modifyFile('package.json', (body) => {
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

    await installDependencies({ cwd: api.resolve() });

    if (api.creator.cmd.link) {
      const availablePackages = Object.keys(packagesVersions);
      const installedAndAvailable = installedPackages.filter((pkg) =>
        availablePackages.includes(pkg),
      );

      for (const pkg of installedAndAvailable) {
        console.log(`Running yarn link ${pkg}...`);
        await run(['yarn', 'link', pkg], { cwd: api.resolve() });
      }

      console.log(`Linking done`);
    }
  });

  api.schedule(api.PRIORITIES.COPY_SECOND, async () => {
    await api.copy({ file: 'chisel.config.chisel-tpl.js' });
  });

  api.schedule(api.PRIORITIES.FORMAT, async () => {
    if (api.creator.cmd.skipFormatAndBuild) return;

    console.log('Formatting code...');
    await runLocalCurrent(['chisel-scripts', 'lint'], { silent: true });
  });

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
