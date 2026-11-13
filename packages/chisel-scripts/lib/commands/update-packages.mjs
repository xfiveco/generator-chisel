import crypto from 'crypto';
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
  husky: '^9.1.7',
  'lint-staged': '^17.6.0',
  prettier: '^3.9.10',
  swiper: '^14.4.0',
};
const ESLINT_PACKAGES = {
  '@eslint/compat': '^2.1.1',
  '@eslint/js': '^10.0.1',
  eslint: '^10.14.0',
  'eslint-config-prettier': '^10.1.8',
  'eslint-plugin-prettier': '^5.5.7',
  'eslint-plugin-react': '^7.37.5',
  globals: '^17.14.0',
};
const ESLINT_OVERRIDES = {
  'eslint-plugin-import': { eslint: '$eslint' },
  'eslint-plugin-jsx-a11y': { eslint: '$eslint' },
  'eslint-plugin-react': { eslint: '$eslint' },
};
const STYLELINT_PACKAGES = {
  stylelint: '^17.16.0',
  'stylelint-config-css-modules': '^4.6.0',
  'stylelint-config-prettier-scss': '^1.0.0',
  'stylelint-config-recess-order': '^7.10.0',
  'stylelint-config-standard-scss': '^17.0.0',
  'stylelint-order': '^8.1.3',
  'stylelint-prettier': '^5.0.3',
};
const ESLINT_WRAPPER = '@xfive/eslint-config-prettier';
const STOCK_WP_SCRIPTS_OVERRIDE = JSON.stringify({
  'eslint-config-prettier': '^9.0.0',
  prettier: '^3.0.0',
});
// Hashes of the config files @xfive/coding-standards wrote, ignoring formatting.
// A file with any other hash has been customised, so it's left alone.
const STOCK_ESLINT_RC = ['bdc7765e', 'c7aeba3c'];
const STOCK_STYLELINT = ['9b1b5a3f'];
const STOCK_PRETTIER = ['db333087'];
const ESLINT_RC_FILE = '.eslintrc.cjs';
const ESLINT_CONFIG_FILE = 'eslint.config.mjs';
const STYLELINT_CONFIG_FILE = 'stylelint.config.mjs';
const PRETTIER_CONFIG_FILE = 'prettier.config.mjs';
const LINTABLE_FILES = ['*.js', '*.jsx', '*.mjs', '*.cjs', '*.css', '*.scss'];
const STOCK_PREPARE = 'chisel-scripts husky-init || node -e ""';
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
const HOOK_HUSKY_8_LINE = /^\. "\$\(dirname -- "\$0"\)\/_\/husky\.sh"\r?\n/m;
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

const configHash = (body) =>
  crypto
    .createHash('md5')
    .update(
      body
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\s+/g, '')
        .replace(/,([}\]])/g, '$1')
        .replace(/"/g, "'"),
    )
    .digest('hex')
    .slice(0, 8);

const readIfExists = (file) =>
  fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;

const majorOf = (range) => Number(versionOf(range ?? '')?.split('.')[0]);

// Adds what's missing from a set of packages that belong together. Other packages
// are only updated when the project already lists them.
const planPackages = (pkg, wanted, { addMissing = false } = {}) => {
  const changes = [];
  const kept = [];

  Object.entries(wanted).forEach(([name, target]) => {
    const section = ['dependencies', 'devDependencies'].find(
      (key) => pkg[key]?.[name],
    );

    if (!section && !addMissing) return;

    if (!section) {
      changes.push({
        name,
        section: 'devDependencies',
        current: 'new',
        target,
      });
      return;
    }

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
        .description('update Node version, npm, Composer and lint packages')
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
      const eslintRcBody = readIfExists(api.resolve(ESLINT_RC_FILE));
      const stylelintBody = readIfExists(api.resolve(STYLELINT_CONFIG_FILE));
      const prettierBody = readIfExists(api.resolve(PRETTIER_CONFIG_FILE));
      const eslintIsOld = majorOf(pkg.devDependencies?.eslint) < 10;
      const stylelintIsOld = majorOf(pkg.devDependencies?.stylelint) < 17;
      // The new ESLint config reads .gitignore, so it needs one to exist.
      const moveEslint =
        eslintIsOld &&
        eslintRcBody !== null &&
        STOCK_ESLINT_RC.includes(configHash(eslintRcBody)) &&
        fs.existsSync(api.resolve('.gitignore'));
      const keepEslint = eslintIsOld && !moveEslint;
      const rebuildLockfile = moveEslint || stylelintIsOld;
      const replaceStylelintConfig =
        stylelintIsOld &&
        stylelintBody !== null &&
        STOCK_STYLELINT.includes(configHash(stylelintBody));
      const keepStylelintConfig =
        stylelintIsOld && stylelintBody !== null && !replaceStylelintConfig;
      const replacePrettierConfig =
        moveEslint &&
        prettierBody !== null &&
        STOCK_PRETTIER.includes(configHash(prettierBody));
      const removeWrapper =
        moveEslint &&
        pkg.devDependencies?.[ESLINT_WRAPPER] &&
        (replacePrettierConfig || !prettierBody?.includes(ESLINT_WRAPPER));

      const plans = [
        planPackages(pkg, PACKAGES),
        ...(moveEslint
          ? [planPackages(pkg, ESLINT_PACKAGES, { addMissing: true })]
          : []),
        ...(stylelintIsOld
          ? [planPackages(pkg, STYLELINT_PACKAGES, { addMissing: true })]
          : []),
      ];
      const changes = plans.flatMap((plan) => plan.changes);
      const kept = plans.flatMap((plan) => plan.kept);

      const scriptsToRemove = REMOVED_SCRIPTS.filter(
        (name) => pkg.scripts?.[name],
      );
      const addOwnScript = !pkg.scripts?.[OWN_SCRIPT.name];
      const lintScript = moveEslint
        ? pkg.scripts?.['lint:script']
            ?.replace(/\s+--ignore-path\s+\S+/g, '')
            .replace(/\s+--ext\s+\S+/g, '')
        : pkg.scripts?.['lint:script'];
      const fixLintScript = lintScript !== pkg.scripts?.['lint:script'];
      const fixPrepare = /husky install/.test(pkg.scripts?.prepare ?? '');
      const removeWpScriptsOverride =
        moveEslint &&
        JSON.stringify(pkg.overrides?.['@wordpress/scripts']) ===
          STOCK_WP_SCRIPTS_OVERRIDE;
      const wantedOverrides = {
        ...OVERRIDES,
        ...(moveEslint ? ESLINT_OVERRIDES : {}),
      };
      const overridesToAdd = missingKeys(pkg.overrides, wantedOverrides);
      const allowScriptsToAdd = missingKeys(pkg.allowScripts, ALLOW_SCRIPTS);
      const hookBody = fs.existsSync(hookPath)
        ? fs.readFileSync(hookPath, 'utf8')
        : '';
      const updatedHook = hookBody
        .replace(HOOK_OLD_LINE, HOOK_NEW_LINE)
        .replace(HOOK_HUSKY_8_LINE, '');
      const fixHook = updatedHook !== hookBody;
      const hasComposer = fs.existsSync(composerPath);
      const hasPackageJsonChange =
        changes.length > 0 ||
        scriptsToRemove.length > 0 ||
        addOwnScript ||
        fixLintScript ||
        fixPrepare ||
        removeWrapper ||
        removeWpScriptsOverride ||
        overridesToAdd.length > 0 ||
        allowScriptsToAdd.length > 0;
      const lintScripts = ['lint:script', 'lint:style'].filter(
        (name) =>
          pkg.scripts?.[name] &&
          (name === 'lint:script' ? moveEslint : stylelintIsOld),
      );

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
        ...(moveEslint ? [ESLINT_RC_FILE] : []),
        ...(replaceStylelintConfig ? [STYLELINT_CONFIG_FILE] : []),
        ...(replacePrettierConfig ? [PRETTIER_CONFIG_FILE] : []),
        'package-lock.json',
        ...(hasComposer ? ['composer.json', 'composer.lock'] : []),
        // Automatic lint fixes shouldn't get mixed in with work in progress.
        ...(lintScripts.length > 0 ? LINTABLE_FILES : []),
      ];

      const gitOptions = { silent: true, cwd: api.resolve() };
      const statusLines = ({ stdout }) => stdout.split(/\r?\n/).filter(Boolean);
      const dirtyFiles = statusLines(
        await run(
          ['git', 'status', '--porcelain', '--', ...touchedFiles],
          gitOptions,
        ),
      );
      const dirtyAtStart = new Set(
        statusLines(
          await run(['git', 'status', '--porcelain'], gitOptions),
        ).map((line) => line.slice(3).replace(/^"|"$/g, '')),
      );

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
      if (fixLintScript) {
        console.log(
          '  npm script "lint:script": removing options ESLint 10 no longer has',
        );
      }
      if (fixPrepare) {
        console.log(`  npm script "prepare": ${STOCK_PREPARE}`);
      }
      if (removeWrapper) {
        console.log(`  ${ESLINT_WRAPPER}: removed`);
      }
      if (moveEslint) {
        console.log(`  ${ESLINT_RC_FILE} → ${ESLINT_CONFIG_FILE}`);
      }
      if (replaceStylelintConfig) {
        console.log(`  ${STYLELINT_CONFIG_FILE}: updated`);
      }
      if (replacePrettierConfig) {
        console.log(`  ${PRETTIER_CONFIG_FILE}: updated`);
      }
      if (keepEslint) {
        console.log(
          `  ${ESLINT_RC_FILE}: customised, so ESLint stays on its current version`,
        );
      }
      if (keepStylelintConfig) {
        console.log(
          `  ${STYLELINT_CONFIG_FILE}: customised, so your file is kept`,
        );
      }
      if (removeWpScriptsOverride) {
        console.log('  overrides: removing the old @wordpress/scripts entry');
      }
      if (rebuildLockfile) {
        console.log(
          '  package-lock.json and node_modules: rebuilt from scratch',
        );
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
        ...(lintScripts.length > 0 ? ['lint with automatic fixes'] : []),
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
        if (fixLintScript) {
          pkg.scripts['lint:script'] = lintScript;
        }
        if (fixPrepare) {
          pkg.scripts.prepare = STOCK_PREPARE;
        }
        if (removeWrapper) {
          delete pkg.devDependencies[ESLINT_WRAPPER];
        }
        if (removeWpScriptsOverride) {
          delete pkg.overrides['@wordpress/scripts'];
        }
        pkg.overrides = {
          ...pkg.overrides,
          ...pickKeys(wantedOverrides, overridesToAdd),
        };
        pkg.allowScripts = {
          ...pkg.allowScripts,
          ...pickKeys(ALLOW_SCRIPTS, allowScriptsToAdd),
        };
        fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
      }

      const lintConfig = (file) =>
        new URL(`../lint-config/${file}`, import.meta.url);

      if (moveEslint) {
        fs.copyFileSync(
          lintConfig(ESLINT_CONFIG_FILE),
          api.resolve(ESLINT_CONFIG_FILE),
        );
        fs.rmSync(api.resolve(ESLINT_RC_FILE));
      }

      if (replaceStylelintConfig) {
        fs.copyFileSync(
          lintConfig(STYLELINT_CONFIG_FILE),
          api.resolve(STYLELINT_CONFIG_FILE),
        );
      }

      if (replacePrettierConfig) {
        fs.copyFileSync(
          lintConfig(PRETTIER_CONFIG_FILE),
          api.resolve(PRETTIER_CONFIG_FILE),
        );
      }

      if (nodeChange) {
        fs.writeFileSync(nvmrcPath, `${NODE_VERSION}\n`);
      }

      if (fixHook) {
        fs.writeFileSync(hookPath, updatedHook);
      }

      if (fixedSlider) {
        fs.writeFileSync(sliderPath, fixedSlider);
      }

      if (fixPipeline) {
        fs.writeFileSync(pipelinePath, updatedPipeline);
      }

      // The old lockfile pins the old lint packages, and npm can't resolve the new ones from it.
      if (rebuildLockfile) {
        fs.rmSync(api.resolve('package-lock.json'), { force: true });
        fs.rmSync(api.resolve('node_modules'), {
          recursive: true,
          force: true,
        });
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
        // Lint errors it can't fix are for the developer, and don't stop the update.
        ...lintScripts.map((name) => ({
          name: `npm run ${name}`,
          args: ['npm', 'run', '--silent', name],
          lint: true,
        })),
        { name: 'production build', args: buildCommand },
      ];

      let lintFailed = false;

      for (const { name, args, optional, lint } of runSteps) {
        console.log(`\n▶ ${name}\n`);

        try {
          await run(args, {
            cwd: api.resolve(),
            execaOpts: { stdio: 'inherit' },
          });
        } catch {
          if (optional) continue;

          if (lint) {
            lintFailed = true;
            continue;
          }

          const prefix = (
            await run(['git', 'rev-parse', '--show-prefix'], gitOptions)
          ).stdout.trim();
          const changedFiles = statusLines(
            await run(['git', 'diff', '--name-only'], gitOptions),
          )
            .filter((file) => !dirtyAtStart.has(file))
            .map((file) =>
              file.startsWith(prefix)
                ? file.slice(prefix.length)
                : `${repoRootPath}${file}`,
            );

          stop(
            `${name} failed, and the update stopped here. Nothing was committed. To undo it:\n\n` +
              `   git checkout -- ${changedFiles.join(' ')}\n` +
              (moveEslint ? `   git clean -f -- ${ESLINT_CONFIG_FILE}\n` : '') +
              '   npm install',
          );
        }
      }

      console.log('\n✅ Packages updated. Nothing has been committed.\n');
      console.log('Next:');
      console.log(
        '  - Run `npm run update-chisel` to update the core files. Do this before `npm start`, because the dev server needs them.',
      );
      console.log('  - Check sliders and blocks in a browser.');
      if (lintFailed) {
        console.log(
          '  - Lint found problems it can not fix automatically. Run `npm run lint` to see them.',
        );
      }
      if (keepEslint) {
        console.log(
          `  - ${ESLINT_RC_FILE} has custom settings, so ESLint was not updated. Move those settings to ${ESLINT_CONFIG_FILE} by hand to update it.`,
        );
      }
      if (keepStylelintConfig) {
        console.log(
          `  - ${STYLELINT_CONFIG_FILE} has custom settings, so it was kept. Stylelint itself was updated.`,
        );
      }
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
        '  - Review the changes with `git diff`, then commit. Automatic lint fixes may have changed some JS and SCSS files.',
      );
    },
  );
}

function pickKeys(source, keys) {
  return Object.fromEntries(keys.map((key) => [key, source[key]]));
}
