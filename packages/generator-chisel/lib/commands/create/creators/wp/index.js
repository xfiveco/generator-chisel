const { execa, runLocal } = require('chisel-shared-utils');
const crypto = require('crypto');
const fs = require('fs-extra');

module.exports = (api) => {
  const gitConfig = (field) =>
    execa('git', ['config', field], {
      timeout: 2000,
      cwd: api.resolve(),
    }).catch(() => ({}));

  let themeName;
  let themePath;

  const wp = (args, opts) =>
    runLocal(['chisel-scripts', 'wp', ...args], {
      ...opts,
      cwd: api.resolve(themePath),
    });

  api.schedule(api.PRIORITIES.PROMPT, async () => {
    ({ themeName, themePath } = api.creator.data.app);

    await api.creator.loadCreator('wp-plugins');

    const userName = gitConfig('user.name');
    const userEmail = gitConfig('user.email');

    let url = `http://${api.creator.data.app.nameSlug}.test/`;
    const { devcontainerPort } = api.creator.data.app;

    if (process.env.CODESPACES === 'true') {
      const {
        CODESPACE_NAME,
        GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN,
      } = process.env;
      url = `https://${CODESPACE_NAME}-${devcontainerPort}.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/`;
    } else if (await fs.exists('/.dockerenv')) {
      url = `http://127.0.0.1:${devcontainerPort}/`;
    }

    await api.prompt([
      {
        name: 'title',
        message: 'Enter title for the new site:',
        default: api.creator.data.app.name,
        validate: (val) => Boolean(val),
      },
      {
        name: 'url',
        message: 'Enter URL:',
        default: url,
        validate: (val) => Boolean(val),
      },
      {
        name: 'adminUser',
        message: 'Enter admin user:',
        default: async () => {
          const nameParts = ((await userName).stdout || '').trim().split(' ');
          if (!nameParts[0]) return undefined;
          return (
            nameParts[0].toLowerCase() + Math.floor(1000 + Math.random() * 9000)
          );
        },
        validate: (val) => Boolean(val),
      },
      {
        name: 'adminPassword',
        message: 'Enter admin password:',
        type: 'password',
        validate: (str) => str.length > 0,
      },
      {
        name: 'adminEmail',
        message: 'Enter admin email:',
        validate: (str) => /.+@.+/.test(str),
        default: async () => {
          const email = ((await userEmail).stdout || '').trim();
          return /.+@.+/.test(email) ? email : undefined;
        },
      },
    ]);

    api.creator.data.wp.tablePrefix = `${crypto
      .randomBytes(32)
      .toString('base64')
      .replace(/[+/=]/g, '')
      .substr(0, 8)
      .toLowerCase()}_`;
  });

  api.schedule(api.PRIORITIES.COPY, async () => {
    const { tablePrefix } = api.creator.data.wp;
    api.creator.data.app.tablePrefix = tablePrefix;
    await api.modifyFile('wp-config.php', (body) =>
      body
        .replace('wp_', tablePrefix)
        .replace(/put your unique phrase here/g, () =>
          crypto.randomBytes(30).toString('base64'),
        ),
    );

    await api.modifyFile(
      `${api.creator.data.app.themePath}/package.json`,
      (body) => {
        body.chisel = {
          tablePrefix,
        };
      },
    );
  });

  api.schedule(api.PRIORITIES.WP_DOWNLOAD, async () => {
    if (api.creator.cmd.skipWpDownload) return;

    await wp(['core', 'download', '--skip-content']);
  });

  api.schedule(api.PRIORITIES.WP_CONFIG, async () => {
    if (api.creator.cmd.skipWpConfig) return;

    const extraArgs = [];

    if (api.creator.data.devcontainerComplete) {
      extraArgs.push('--devcontainer');
    }

    await runLocal(['chisel-scripts', 'wp-config', ...extraArgs], {
      cwd: api.resolve(themePath),
      execaOpts: { stdio: 'inherit' },
    });
  });

  api.schedule(api.PRIORITIES.WP_INSTALL, async () => {
    const { wp: wpData } = api.creator.data;

    if (api.creator.cmd.skipWpInstall) {
      delete wpData.adminPassword;
      return;
    }

    await wp([
      'core',
      'install',
      {
        url: wpData.url,
        title: wpData.title,
        admin_user: wpData.adminUser,
        admin_password: wpData.adminPassword,
        admin_email: wpData.adminEmail,
      },
    ]);

    delete wpData.adminPassword;
  });

  api.schedule(api.PRIORITIES.WP_INSTALL_PLUGINS, async () => {
    if (api.creator.cmd.skipWpCommands) return;

    await runLocal(['chisel-scripts', 'composer', 'install'], {
      cwd: api.resolve(themePath),
    });
    await wp([
      'plugin',
      'install',
      'disable-emojis',
      'https://github.com/wp-premium/advanced-custom-fields-pro/archive/master.zip',
      'xfive-sync-watcher-for-acf',
      { activate: true },
    ]);
  });

  api.schedule(api.PRIORITIES.WP_THEME_ACTIVATE, async () => {
    if (api.creator.cmd.skipWpCommands) return;

    await wp(['theme', 'activate', themeName]);
  });

  api.schedule(api.PRIORITIES.WP_UPDATE_OPTIONS, async () => {
    if (api.creator.cmd.skipWpCommands) return;

    await wp(['option', 'update', 'permalink_structure', '/%postname%/']);
    await wp(['option', 'update', 'blog_public', '0']);
    await wp(['option', 'update', 'default_comment_status', 'closed']);
    await wp(['option', 'update', 'default_pingback_flag', '0']);
    await wp(['option', 'update', 'default_ping_status', 'closed']);
    await wp(['option', 'update', 'comment_moderation', '1']);
    await wp(['option', 'update', 'comment_registration', '1']);
  });
};
