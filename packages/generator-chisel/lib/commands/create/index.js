const Creator = require('./Creator');

const createCommand = async ({ args, cmd }) => {
  const creator = new Creator(undefined, { args, cmd });

  if (cmd.devcontainer) {
    await creator.loadCreator('devcontainer');
  } else {
    await creator.loadCreator('init');
    await creator.loadCreator('app');
  }

  return creator.run();
};

module.exports = createCommand;
