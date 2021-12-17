const Creator = require('./Creator');

const createCommand = async ({ args, cmd }) => {
  const creator = new Creator(undefined, { args, cmd });

  await creator.loadCreator('init');
  await creator.loadCreator('app');

  return creator.run();
};

module.exports = createCommand;
