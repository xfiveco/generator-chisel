const { runLocal } = require('chisel-shared-utils');

module.exports = (api) => {
  const runLocalCurrent = (args, opts) =>
    runLocal(args, { ...opts, cwd: api.resolve() });

  api.schedule(api.PRIORITIES.PROMPT, async () => {
    await api.prompt([
      {
        type: 'checkbox',
        name: 'additionalFeatures',
        message: 'Additional features:',
        choices: [
          {
            value: 'serveDist',
            name: "Serve dist directory in dev / don't generate pages index",
          },
          {
            value: 'skipHtmlExtension',
            name: "Don't include html extension in links (posts API) & support them in dev",
          },
        ],
      },
    ]);
  });

  api.schedule(api.PRIORITIES.COPY, async () => {
    await api.copy();

    if (!api.creator.data.fe.additionalFeatures.includes('serveDist')) {
      await api.copy({ from: 'template-index' });

      // lodash escaping seems to be broken, we use custom one
      await api.modifyFile('index.html', (file) => {
        return file.replace(/<\\%/g, '<%');
      });
    }

    api.schedule(api.PRIORITIES.FE_ADD_INDEX, async () => {
      if (api.creator.cmd.skipFeAddIndex) return;
      if (!api.creator.data.fe.additionalFeatures.includes('serveDist')) return;

      console.log('Adding index.twig page...');
      await runLocalCurrent(
        ['chisel-scripts', 'add-page', 'Index', '--no-build'],
        { execaOpts: { stdio: 'inherit' } },
      );
    });
  });
};
