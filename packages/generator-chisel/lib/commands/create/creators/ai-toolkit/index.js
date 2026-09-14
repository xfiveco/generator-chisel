const { run } = require('chisel-shared-utils');

const PACKAGE = '@xfive/chisel-ai-toolkit';

module.exports = (api) => {
  if (api.creator.cmd.skipAiToolkit) return;

  api.schedule(api.PRIORITIES.PROMPT, async () => {
    await api.prompt([
      {
        type: 'confirm',
        name: 'install',
        message:
          'Install Chisel AI toolkit (skills and rules for AI coding agents)?',
        default: true,
      },
    ]);
  });

  api.schedule(api.PRIORITIES.AI_TOOLKIT, async () => {
    if (!api.creator.data.aiToolkit.install) return;
    if (api.creator.cmd.skipDependenciesInstall) return;

    await run(['npm', 'install', '--save-dev', PACKAGE], {
      cwd: api.resolve(api.creator.data.app.themePath),
      execaOpts: { stdio: 'inherit' },
    });
  });
};
