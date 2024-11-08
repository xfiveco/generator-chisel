const { prepareName, getWordpressVersion } = require('./utils');
const fsPromises = require('fs/promises');

module.exports = async (api) => {
  let app;

  api.schedule(api.PRIORITIES.PROMPT, async () => {
    app = await api.prompt([
      {
        name: 'name',
        message: 'Please enter the project name:',
        validate: (val) => Boolean(val),
      },
      {
        type: 'number',
        name: 'devcontainerPort',
        message: 'Enter the devcontainer port:',
        default: 3000,
        validate: (val) => Boolean(val),
      },
    ]);

    const responsesAsBase64 = Buffer.from(JSON.stringify(app)).toString(
      'base64'
    );

    Object.assign(app, prepareName(app.name));
    app.devcontainer = true;
    app.responsesAsBase64 = responsesAsBase64;
    app.wordpressVersion = await getWordpressVersion();
    api.creator.data.app = app;
  });

  api.schedule(api.PRIORITIES.COPY, async () => {
    await api.copy({
      from: '../app/template/.devcontainer',
      to: '.devcontainer',
    });

    await fsPromises.mkdir(api.creator.data.app.themePath, {
      recursive: true,
    });

    await fsPromises.writeFile('index.php', '');
    await fsPromises.writeFile('wp-config.php', '');
  });

  api.schedule(api.PRIORITIES.END_MESSAGE, async () => {
    console.log('END MESSAGE');
  });
};
