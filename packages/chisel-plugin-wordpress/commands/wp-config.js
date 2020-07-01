module.exports = (api, options) => {
  api.registerCommand(
    'wp-config',
    (command) =>
      command.description(
        'configure WP (writes wp/wp-config-local.php an dev-vhost.conf)',
      ),
    async () => {
      const { runLocal, copy } = require('chisel-shared-utils');
      const runLocalCurrent = (args, opts) =>
        runLocal(args, { ...opts, cwd: api.resolve() });
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

        const { url } = options.wp;
        const { tablePrefix } = options.creatorData.wp;

        await copy({
          from: path.join(__dirname, '../template'),
          to: api.resolve(),
          templateData: {
            ...answers,
            documentRoot: api.resolve('wp'),
            serverName: new URL(url).hostname,
            tablePrefix,
          },
        });

        const res = await runLocalCurrent(['wp', 'db', 'query', 'SELECT 1'], {
          reject: false,
          silent: true,
        });

        if (res.exitCode !== 0) {
          if (
            res.stderr.includes('ERROR 1049') ||
            res.stderr.includes('Unknown database')
          ) {
            await runLocalCurrent(['wp', 'db', 'create']);
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
            await runLocalCurrent(['wp', 'db', 'drop', '--yes']);
            await runLocalCurrent(['wp', 'db', 'create']);
          }
        }
      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          await promptAndCreateDB();
          break;
        } catch (e) {
          console.log('');
          console.log('Trying again...');
          console.log('');
        }
      }
    },
  );
};
