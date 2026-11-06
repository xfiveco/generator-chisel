import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import chiselSharedUtils from 'chisel-shared-utils';
import { compareVersions } from './chisel-update.mjs';

const { run } = chiselSharedUtils;

const { version: ownVersion } = createRequire(import.meta.url)(
  '../../package.json',
);

// The set tested together for this release. Keep it in step with the starter
// theme's package.chisel-tpl.json in generator-chisel.
const NODE_VERSION = '26.13.0';
const PACKAGES = {
  '@wordpress/interactivity': '^8.1.0',
  '@wordpress/scripts': '^37.1.0',
  'chisel-scripts': `^${ownVersion}`,
  'cross-env': '^10.1.0',
  swiper: '^14.4.0',
};
const OVERRIDES = {
  'js-yaml@5': '^5.5.0',
  katex: '^0.19.1',
  'minimatch@10': '^11.0.5',
  'npm-packlist': { glob: '^14.0.4' },
  'serialize-javascript': '^7.1.4',
  'smol-toml': '^1.9.1',
  'source-map-loader': '^5.0.0',
  tmp: '^0.2.7',
};
const ALLOW_SCRIPTS = {
  '@parcel/watcher': false,
  '@xfive/chisel-ai-toolkit': true,
  'core-js': false,
  'core-js-pure': false,
};
const REMOVED_SCRIPTS = ['add-page', 'create-block'];
const OWN_SCRIPT = {
  name: 'update-packages',
  command: 'chisel-scripts update-packages',
};
const HOOK_FILE = '.husky/pre-commit';
const HOOK_OLD_LINE = 'REPO_ROOT=$(git rev-parse --show-toplevel)';
const HOOK_NEW_LINE =
  'REPO_ROOT=$(cd "$(git rev-parse --show-toplevel)" && pwd)';
const SWIPER_SVG_ARROWS_MAJOR = 12;
const SLIDER_FILE = 'src/styles/components/_slider.scss';
const SLIDER_STOCK_ARROWS = /( *)&::after \{\s*font-size: px-rem\(24\);\s*color: get-color\('primary'\);\s*transition: get-transition\('normal'\);\s*\}\s*&:hover \{\s*background-color: rgba\(255, 255, 255, 100%\);\s*&::after \{\s*color: get-color\('foreground'\);\s*\}\s*\}/;
const SLIDER_BUTTON_MARGIN = /(\.swiper-button \{[^}]*?margin: 0;\r?\n)( *)/;

// Stock styles only. A project's own arrow styles are left for the developer.
const fixSliderArrows = (body) => {
  if (!SLIDER_STOCK_ARROWS.test(body) || !SLIDER_BUTTON_MARGIN.test(body)) {
    return null;
  }

  return body
    .replace(SLIDER_BUTTON_MARGIN, "$1$2color: get-color('primary');\n$2")
    .replace(SLIDER_STOCK_ARROWS, (_, indent) =>
      [
        `${indent}svg {`,
        `${indent}  width: px-rem(24);`,
        `${indent}  height: px-rem(24);`,
        `${indent}}`,
        '',
        `${indent}&:hover {`,
        `${indent}  color: get-color('foreground');`,
        `${indent}  background-color: rgba(255, 255, 255, 100%);`,
        `${indent}}`,
      ].join('\n'),
    );
};

const MINIMUM_NODE_MAJOR = 26;
const PIPELINE_FILE = '.gitlab-ci.yml';

const nodeMajor = (version) => Number(version.split('.')[0]);

// Handles images such as node:24.11.1, node:24 and node:24-alpine.
const updatePipelineNode = (body) =>
  body.replace(
    /(image:\s*['"]?node:)(\d+(?:\.\d+)*)((?:-[\w.-]+)?)/g,
    (match, before, version, suffix) =>
      nodeMajor(version) >= MINIMUM_NODE_MAJOR
        ? match
        : `${before}${NODE_VERSION}${suffix}`,
  );

// '^1.2.3' gives '1.2.3'. Values with no version, such as '*' or 'file:...', give null.
const versionOf = (range) =>
  /^[\^~>=\s]*(\d+\.\d+\.\d+)/.exec(range)?.[1] ?? null;

const planPackages = (pkg) => {
  const changes = [];
  const kept = [];

  Object.entries(PACKAGES).forEach(([name, target]) => {
    const section = ['dependencies', 'devDependencies'].find(
      (key) => pkg[key]?.[name],
    );

    if (!section) return;

    const current = pkg[section][name];
    const currentVersion = versionOf(current);

    if (current === target) return;

    if (
      currentVersion &&
      compareVersions(currentVersion, versionOf(target)) > 0
    ) {
      kept.push({ name, current });
      return;
    }

    changes.push({ name, section, current, target });
  });

  return { changes, kept };
};

const missingKeys = (existing = {}, wanted) =>
  Object.keys(wanted).filter((key) => !(key in existing));

export default function updatePackages(api) {
  api.registerCommand(
    OWN_SCRIPT.name,
    (command) =>
      command
        .description('update Node version, npm and Composer packages')
        .option('--dry-run', 'show what would change without changing it'),
    async ({ dryRun }) => {
      const stop = (message) => {
        console.error(`\n❌ ${message}`);
        process.exit(1);
      };

      if (nodeMajor(process.versions.node) < MINIMUM_NODE_MAJOR) {
        stop(
          `Chisel needs Node ${MINIMUM_NODE_MAJOR} or newer, and this is Node ${process.versions.node}. Switch first, then run this again:\n\n` +
            `   nvm install ${NODE_VERSION}\n   nvm use ${NODE_VERSION}`,
        );
      }

      let repoRootPath;
      try {
        const { stdout } = await run(['git', 'rev-parse', '--show-cdup'], {
          silent: true,
          cwd: api.resolve(),
        });
        repoRootPath = stdout.trim();
      } catch {
        stop(
          'This project is not in a git repository, so the update could not be undone. Run `git init` and commit first.',
        );
      }

      const pipelineFile = `${repoRootPath}${PIPELINE_FILE}`;
      const pipelinePath = api.resolve(pipelineFile);
      const pipelineBody = fs.existsSync(pipelinePath)
        ? fs.readFileSync(pipelinePath, 'utf8')
        : '';
      const updatedPipeline = updatePipelineNode(pipelineBody);
      const fixPipeline = updatedPipeline !== pipelineBody;

      const pkgPath = api.resolve('package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const nvmrcPath = api.resolve('.nvmrc');
      const hookPath = api.resolve(HOOK_FILE);
      const composerPath = api.resolve('composer.json');

      const currentNode = fs.existsSync(nvmrcPath)
        ? fs.readFileSync(nvmrcPath, 'utf8').trim()
        : null;
      const nodeChange =
        !versionOf(currentNode ?? '') ||
        compareVersions(versionOf(currentNode), NODE_VERSION) < 0;
      const { changes, kept } = planPackages(pkg);
      const scriptsToRemove = REMOVED_SCRIPTS.filter(
        (name) => pkg.scripts?.[name],
      );
      const addOwnScript = !pkg.scripts?.[OWN_SCRIPT.name];
      const overridesToAdd = missingKeys(pkg.overrides, OVERRIDES);
      const allowScriptsToAdd = missingKeys(pkg.allowScripts, ALLOW_SCRIPTS);
      const hookBody = fs.existsSync(hookPath)
        ? fs.readFileSync(hookPath, 'utf8')
        : '';
      const fixHook = hookBody.includes(HOOK_OLD_LINE);
      const hasComposer = fs.existsSync(composerPath);
      const hasPackageJsonChange =
        changes.length > 0 ||
        scriptsToRemove.length > 0 ||
        addOwnScript ||
        overridesToAdd.length > 0 ||
        allowScriptsToAdd.length > 0;

      const swiperChange = changes.find(({ name }) => name === 'swiper');
      const swiperWasOld =
        swiperChange &&
        Number(versionOf(swiperChange.current)?.split('.')[0]) <
          SWIPER_SVG_ARROWS_MAJOR;
      const sliderPath = api.resolve(SLIDER_FILE);
      const fixedSlider =
        swiperWasOld && fs.existsSync(sliderPath)
          ? fixSliderArrows(fs.readFileSync(sliderPath, 'utf8'))
          : null;

      const touchedFiles = [
        ...(nodeChange ? ['.nvmrc'] : []),
        'package.json',
        ...(fixHook ? [HOOK_FILE] : []),
        ...(fixedSlider ? [SLIDER_FILE] : []),
        ...(fixPipeline ? [pipelineFile] : []),
        'package-lock.json',
        ...(hasComposer ? ['composer.json', 'composer.lock'] : []),
      ];

      const { stdout: dirtyOutput } = await run(
        ['git', 'status', '--porcelain', '--', ...touchedFiles],
        { silent: true, cwd: api.resolve() },
      );
      const dirtyFiles = dirtyOutput.split(/\r?\n/).filter(Boolean);

      console.log(`\nChisel package update (chisel-scripts ${ownVersion})\n`);

      if (nodeChange) {
        console.log(`  .nvmrc: ${currentNode ?? 'none'} → ${NODE_VERSION}`);
      }
      changes.forEach(({ name, current, target }) => {
        console.log(`  ${name}: ${current} → ${target}`);
      });
      kept.forEach(({ name, current }) => {
        console.log(`  ${name}: keeping ${current}, it is newer`);
      });
      scriptsToRemove.forEach((name) => {
        console.log(
          `  npm script "${name}": removed, the command no longer exists`,
        );
      });
      if (addOwnScript) {
        console.log(`  npm script "${OWN_SCRIPT.name}": added`);
      }
      if (overridesToAdd.length > 0) {
        console.log(`  overrides: adding ${overridesToAdd.join(', ')}`);
      }
      if (allowScriptsToAdd.length > 0) {
        console.log(`  allowScripts: adding ${allowScriptsToAdd.join(', ')}`);
      }
      if (fixHook) {
        console.log(`  ${HOOK_FILE}: fixing the core files check on Windows`);
      }
      if (fixedSlider) {
        console.log(`  ${SLIDER_FILE}: updating the arrow styles for Swiper`);
      }
      if (fixPipeline) {
        console.log(`  ${PIPELINE_FILE}: Node image → ${NODE_VERSION}`);
      }

      if (
        !nodeChange &&
        !hasPackageJsonChange &&
        !fixHook &&
        !fixPipeline &&
        kept.length === 0
      ) {
        console.log('  Already on the tested versions.');
      }

      const steps = [
        'npm install',
        'npm audit fix',
        ...(hasComposer ? ['composer update'] : []),
        'production build',
      ];

      console.log(`\nThen runs: ${steps.join(', ')}.`);

      if (dirtyFiles.length > 0) {
        const message = `These files have uncommitted changes. Commit or undo them first:\n\n${dirtyFiles
          .map((line) => `   ${line}`)
          .join('\n')}`;

        if (!dryRun) stop(message);

        console.log(`\n⚠️  A real run would stop here. ${message}`);
      }

      if (dryRun) {
        console.log('\nDry run: nothing was changed.');
        return;
      }

      if (hasPackageJsonChange) {
        changes.forEach(({ name, section, target }) => {
          pkg[section][name] = target;
        });
        scriptsToRemove.forEach((name) => {
          delete pkg.scripts[name];
        });
        if (addOwnScript) {
          pkg.scripts = {
            ...pkg.scripts,
            [OWN_SCRIPT.name]: OWN_SCRIPT.command,
          };
        }
        pkg.overrides = {
          ...pkg.overrides,
          ...pickKeys(OVERRIDES, overridesToAdd),
        };
        pkg.allowScripts = {
          ...pkg.allowScripts,
          ...pickKeys(ALLOW_SCRIPTS, allowScriptsToAdd),
        };
        fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
      }

      if (nodeChange) {
        fs.writeFileSync(nvmrcPath, `${NODE_VERSION}\n`);
      }

      if (fixHook) {
        fs.writeFileSync(
          hookPath,
          hookBody.replace(HOOK_OLD_LINE, HOOK_NEW_LINE),
        );
      }

      if (fixedSlider) {
        fs.writeFileSync(sliderPath, fixedSlider);
      }

      if (fixPipeline) {
        fs.writeFileSync(pipelinePath, updatedPipeline);
      }

      const composerPhar = fileURLToPath(
        new URL('../../composer.phar', import.meta.url),
      );
      const buildCommand = pkg.scripts?.['build-scripts']
        ? ['npm', 'run', 'build-scripts']
        : ['npx', 'chisel-scripts', 'build'];

      const runSteps = [
        { name: 'npm install', args: ['npm', 'install'] },
        // Exits with an error when some issues have no fix yet, which isn't a failure here.
        {
          name: 'npm audit fix',
          args: ['npm', 'audit', 'fix'],
          optional: true,
        },
        ...(hasComposer
          ? [
              {
                name: 'composer update',
                args: ['php', composerPhar, '--ansi', 'update'],
              },
            ]
          : []),
        { name: 'production build', args: buildCommand },
      ];

      for (const { name, args, optional } of runSteps) {
        console.log(`\n▶ ${name}\n`);

        try {
          await run(args, {
            cwd: api.resolve(),
            execaOpts: { stdio: 'inherit' },
          });
        } catch {
          if (optional) continue;

          const trackedFiles = await run(
            ['git', 'ls-files', '--', ...touchedFiles],
            { silent: true, cwd: api.resolve() },
          );

          stop(
            `${name} failed, and the update stopped here. Nothing was committed. To undo it:\n\n` +
              `   git checkout -- ${trackedFiles.stdout
                .split(/\r?\n/)
                .filter(Boolean)
                .join(' ')}\n   npm install`,
          );
        }
      }

      console.log('\n✅ Packages updated. Nothing has been committed.\n');
      console.log('Next:');
      console.log('  - Check sliders and blocks in a browser.');
      if (swiperWasOld) {
        console.log(
          `  - Swiper now draws its arrows as SVG, so styles on ::after and icons on ::before need checking.${
            fixedSlider
              ? ` The stock styles in ${SLIDER_FILE} were updated, but custom arrows elsewhere were not.`
              : ` Update ${SLIDER_FILE}, or the arrows show in Swiper's default blue.`
          }`,
        );
      }
      console.log(
        '  - Run `npm run update-chisel` before `npm start`. The dev server needs the new core files, and this command does not change them.',
      );
      console.log('  - Review the changes with `git diff`, then commit.');
    },
  );
}

function pickKeys(source, keys) {
  return Object.fromEntries(keys.map((key) => [key, source[key]]));
}
