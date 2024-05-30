module.exports = (api, options) => {
  api.registerCommand(
    'wp-config',
    (command) =>
      command.description(
        'configure WP (writes wp/wp-config-local.php an dev-vhost.conf)',
      ),
    async () => {
      const { runLocal, copy } = require('chisel-shared-utils');
      const wp = (args, opts) =>
        runLocal(['chisel-scripts', 'wp', ...args], {
          ...opts,
          cwd: api.resolve(),
        });
      const inquirer = require('inquirer');
      const path = require('path');

      const prompts = [
        {
          name: 'databaseHost',
          message: 'Enter the database host:',
          default: '127.0.0.1',
        },
        {
          type: 'number',
          name: 'databasePort',
          message: 'Enter the database port:',
          default: 3306,
        },
        {
          name: 'databaseName',
          message: 'Enter the database name:',
          default: require(api.resolve('package.json')).name,
        },
        {
          name: 'databaseUser',
          message: 'Enter the database user:',
          default: 'root',
        },
        {
          type: 'password',
          name: 'databasePassword',
          message: 'Enter the database password:',
        },
      ];

      const promptAndCreateDB = async () => {
        const answers = await inquirer.prompt(prompts);

        answers.databaseHostPort = `${answers.databaseHost}:${answers.databasePort}`;

        const { url, tablePrefix } = options;

        console.log('Creating database...');
        console.log(api.resolve());

        await copy({
          from: path.join(__dirname, '../template'),
          to: api.resolveRoot(),
          templateData: {
            ...answers,
            documentRoot: api.resolveRoot(),
            serverName: new URL(url).hostname,
            tablePrefix,
          },
        });

        const res = await wp(['db', 'query', 'SELECT 1'], {
          reject: false,
          silent: true,
        });

        if (res.exitCode !== 0) {
          if (
            res.stderr.includes('ERROR 1049') ||
            res.stderr.includes('Unknown database')
          ) {
            await wp(['db', 'create']);
          } else {
            console.log(res.stdout);
            console.log(res.stderr);
            throw res;
          }
        } else {
          // exists
          const { useExisting } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'useExisting',
              message:
                'Database already exist, do you want to use existing database?',
            },
          ]);

          if (!useExisting) {
            await wp(['db', 'drop', '--yes']);
            await wp(['db', 'create']);
          }
        }
      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          await promptAndCreateDB();
          break;
        } catch (e) {
          console.log(e); // TODO: remove
          console.log('');
          console.log('Trying again...');
          console.log('');
        }
      }
    },
  );
};
