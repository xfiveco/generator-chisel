const fs = require('fs');
const path = require('path');
const Creator = require('./Creator');

const MINIMUM_NODE_MAJOR = 26;

const createCommand = async ({ args, cmd }) => {
  // With --devcontainer, packages are installed inside the container, which has its own Node.
  if (
    !cmd.devcontainer &&
    Number(process.versions.node.split('.')[0]) < MINIMUM_NODE_MAJOR
  ) {
    const nodeVersion = fs
      .readFileSync(
        path.join(__dirname, 'creators/app/chisel-starter-theme/.nvmrc'),
        'utf8',
      )
      .trim();

    console.error(
      `\n❌ Chisel needs Node ${MINIMUM_NODE_MAJOR} or newer, and this is Node ${process.versions.node}. Switch first, then run this again:\n\n` +
        `   nvm install ${nodeVersion}\n   nvm use ${nodeVersion}\n`,
    );
    process.exit(1);
  }

  const creator = new Creator(undefined, { args, cmd });

  if (cmd.devcontainer) {
    await creator.loadCreator('devcontainer');
  } else {
    if (!cmd.devcontainerComplete) {
      await creator.loadCreator('init');
    }

    await creator.loadCreator('app');
  }

  return creator.run();
};

module.exports = createCommand;
