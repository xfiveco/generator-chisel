function run(args, options = {}) {
  const { silent = false, cwd, reject = true, execaOpts = {} } = options;
  const { interactive = !silent } = options;

  const execa = require('execa');
  const execaOptsNormalized = {
    stdio: [interactive ? 'inherit' : 'pipe', 'pipe', 'pipe'],
    cwd,
    reject,
    ...execaOpts,
  };

  const argsNormalized = []
    .concat(
      ...args.slice(1).map((arg) => {
        if (typeof arg !== 'object') return arg;

        return Object.entries(arg).map(([key, val]) =>
          typeof val === 'boolean' ? val && `--${key}` : `--${key}=${val}`,
        );
      }),
    )
    .filter(Boolean);

  const runn = execa(args[0], argsNormalized, execaOptsNormalized);

  if (!silent) {
    if (runn.stdout) runn.stdout.pipe(process.stdout);
    if (runn.stderr) runn.stderr.pipe(process.stderr);
  }

  return runn;
}

module.exports.run = run;

function runLocal(args, options = {}) {
  const { hasYarn } = require('./package-manager');
  const start = hasYarn() ? ['yarn', '--silent'] : ['npx'];
  return run([...start, ...args], options);
}

module.exports.runLocal = runLocal;

async function runWithExitBase(args, options = {}, helper) {
  const { exitCode } = await helper(args, {
    interactive: true,
    ...options,
    reject: false,
  });
  process.exit(exitCode);
}

function runWithExit(args, options) {
  return runWithExitBase(args, options, run);
}

module.exports.runWithExit = runWithExit;

function runLocalWithExit(args, options) {
  return runWithExitBase(args, options, runLocal);
}

module.exports.runLocalWithExit = runLocalWithExit;
