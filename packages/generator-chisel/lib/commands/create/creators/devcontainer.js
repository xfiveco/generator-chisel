const { prepareName, getDevcontainerBaseImageVersion } = require('./utils');
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
    app.devcontainerBaseImageVersion = await getDevcontainerBaseImageVersion();
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
    console.log(`
Devcontainer definition is ready.

To continue creating the project do one of the following:

1. If you are using VS Code, open the folder in VS Code and run
   "Dev Containers: Reopen in Container" from the command palette.

2. Otherwise you have to use Dev Containers CLI to start the container:
   > npx -y @devcontainers/cli@latest up --workspace-folder .
   (dot at the end is part of the command)
`);
  });
};
