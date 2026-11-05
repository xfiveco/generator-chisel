# Node 26 and package update plan

Two releases, so a problem in Chisel's own old packages can't hold up the move to Node 26.

- **Release 1:** Node 26, wp-scripts 37, starter theme packages, lint packages without `@xfive/coding-standards`.
- **Release 2:** the old packages inside chisel-scripts, chisel-shared-utils and generator-chisel.

Versions below were the latest on 2026-11-05. Recheck them when you start.

## What has been tested so far

Tested on Node 26.13.0 in temporary copies:

- Your theme (current packages and wp-scripts 37): install, production build, lint, WP-CLI, Composer.
- Starter theme with wp-scripts 37, Swiper 14, Interactivity 8, cross-env 10, husky 9: install, production build, WP-CLI, Composer. This copy did not include the lint packages.
- Your theme's build on Node 26 was byte-for-byte the same as on Node 24.
- `chisel --help`, `chisel create --help` and `lerna ls` start.

Not tested yet:

- `npm start` in a browser, including hot reload. It compiles, but the check that it answers requests never finished.
- A full `chisel create`.
- `add-page`, `wp-config`, `create-block`, the icon module and the devcontainer.
- `lerna publish` on Node 26.
- The new lint package versions from step 6. Those come from what each package says it supports.
- Anything in a browser, including Swiper 14.

---

# Release 1

## 1. Install Node 26

- Upgrade nvm from 1.1.10 to 1.2.2 first, because 1.1.10 crashes on `nvm install` when you ask for the newest Node version. Run the 1.2.2 installer and keep the same nvm and Node folders.
- Run `nvm install 26.13.0`, then `nvm use 26.13.0`. Keep 24.11.1 for other projects.
- nvm keeps global tools per Node version, so reinstall them on 26: `yarn`, plus `@automattic/vip`, `@playwright/cli` and `@ast-grep/cli` if you use them.
- In this repo, run `yarn install`, then `yarn prepare-links` to reconnect the `chisel` commands to your local code. PHP must be available, because linking chisel-scripts fetches WP-CLI and Composer.
- Check that `chisel --help` and `npx lerna ls` work.

## 2. Create a working branch

- Commit or set aside the two uncommitted files (`core/WP/Theme.php` and `README.chisel-tpl.md`) so they don't mix with this work.
- Branch from `v2`.
- Don't merge into `v2` until release day. Existing projects read their core files and version number from the `v2` branch on GitHub, so anything there is live for them straight away.

## 3. Update the Node version everywhere

| Where | Now | Change to |
|---|---|---|
| Starter theme `.nvmrc` | 24.11.1 | 26.13.0 |
| chisel-scripts `lib/template/.nvmrc` | 24.11.1 | 26.13.0 |
| Repo root `.nvmrc` | 12 | 26.13.0 |
| Starter theme `README.md` | 24.11.1, minimum 20.12.2 | 26.13.0, minimum 22.22.2 or 24.15.0 |
| Devcontainer template, Node feature | 20 | 26 |
| Project README template, "Joining the project" requirements | Node.js 20+ | Node.js 26, minimum 22.22.2 or 24.15.0 |

The minimum comes from wp-scripts 37, which requires Node `^22.22.2 || ^24.15.0 || >=26.0.0`.

## 4. Make chisel-scripts accept wp-scripts 37

- Add `^37.0.0` to the supported wp-scripts versions in its `package.json`. Keep the older versions, so existing projects keep working.
- Test `npm start` on a real local site. **This is the main risk:** wp-scripts 37 brings dev server version 6, and chisel-scripts customises that server (allowed hosts, error overlay, WebSocket address, startup message).
- Edit a SCSS file and a JS file, and confirm the page updates and the browser console is clean.
- If you use devcontainers, test there too. That route uses a different WebSocket address.

## 5. Update the starter theme's packages

In `package.chisel-tpl.json`:

| Package | Now | Change to | Check |
|---|---|---|---|
| `@wordpress/scripts` | ^31.2.0 | ^37.1.0 | Build and dev server |
| `@wordpress/interactivity` | ^6.36.0 | ^8.1.0 | Interactive blocks in a browser |
| `swiper` | ^11.1.10 | ^14.4.0 | Sliders in a browser. Fixes the critical security advisory, which affects versions below 12.1.2 |
| `cross-env` | ^7.0.3 | ^10.1.0 | `phpcs`, `phpcbf`, `twigcs` scripts |

`husky` is already ^9.1.7 in the template.

## 6. Replace `@xfive/coding-standards`

Here is what it does for Chisel today, and where each part moves:

| What it does | Where it goes |
|---|---|
| Installs the lint packages | Template `devDependencies` (versions below) |
| Writes `prettier.config.mjs`, `lint-staged.config.mjs`, `stylelint.config.mjs`, `.stylelintignore`, `.prettierignore`, `.vscode/settings.json`, `.vscode/extensions.json` | Starter theme files. Your `rfs-wp-chisel` theme has the finished versions to start from |
| Overwrites `.editorconfig` | Check that the starter theme's copy matches, then keep it |
| Creates `.eslintrc.cjs` | Rewrite as `eslint.config.mjs` for ESLint 10. Keep the three React rules that are switched off and the ignore patterns |
| Adds `lint:script`, `lint:style`, `lint`, `format`, `format-and-lint` scripts | Template `scripts`. Remove `--ignore-path` and `--ext` from `lint:script`, because the new ESLint format doesn't have them |
| Adds `npx lint-staged` to the pre-commit hook | Starter theme `.husky/pre-commit`. Keep the existing core files check |
| Formats and lints each new project | Run it once on the starter theme and commit the result. Also turn on the generator's commented-out format step, so new projects come out clean |

Then remove from the generator (`creators/app/index.js`):

- The `npx @xfive/coding-standards@latest` call.
- The "Restore prepare script" block after it, which only exists to repair what that tool overwrites.

Lint package versions:

| Package | Your theme | Use | Note |
|---|---|---|---|
| `eslint` | 8 | 10 | Needs the new config format |
| `eslint-plugin-react` | 7.37 | 7.37 (latest) | Officially supports ESLint up to 9.7, but WordPress's own plugin pairs it with ESLint 10 |
| `eslint-config-prettier` | Through wrapper | 10 | Now listed directly |
| `eslint-plugin-prettier` | Through wrapper | 5 | Now listed directly |
| `@xfive/eslint-config-prettier` | 0.2.2 | Remove | Thin wrapper. Its Prettier part is only `singleQuote: true`, so put that in `prettier.config.mjs` |
| `prettier` | 3.9.10 | 3.9.10 | Already latest |
| `lint-staged` | 15 | 17 | |
| `husky` | 8 | 9 | The tool forced 8 even though the template asks for 9 |
| `stylelint` | 16 | **17, not 18** | The scss, recess-order and css-modules configs only accept up to 17. wp-scripts 37 also uses 17 |
| `stylelint-config-standard-scss` | 12 | 17 | |
| `stylelint-config-recess-order` | 4 | 7 | Also needs `stylelint-order` installed |
| `stylelint-config-css-modules` | 4.6 | 4.6 | Already latest |
| `stylelint-config-prettier-scss` | 1.0 | 1.0 | Already latest, unchanged since 2023 |
| `stylelint-prettier` | 5.0.3 | 5.0.3 | Already latest |

Notes:

- Test ESLint 10 with the React plugin first. If they don't work together, fall back to ESLint 9.39, which is still maintained and which the plugin officially supports.
- Newer rules will probably flag some starter theme code, so expect a one-time cleanup.
- Recheck the template's `overrides` section (`eslint-config-prettier`, `prettier`) once the lint packages are in, and remove it if it's no longer needed.
- Other projects can still use `@xfive/coding-standards`. This only removes it from the generator.

## 7. Test a new project from start to finish

Run `chisel create --link` in an empty folder with a real local WordPress, then check:

- [ ] Install is clean, and `npm ci` works afterwards
- [ ] `npm run build` passes (this also runs lint, phpcs, twigcs and the update check)
- [ ] `npm start` works in a browser, with hot reload
- [ ] `npm run lint` and `npm run format` pass and change nothing unexpected
- [ ] A commit triggers the pre-commit hook, including the core files check
- [ ] `npm run add-page`
- [ ] `npm run create-block`, with the standard and ACF templates
- [ ] `npm run wp-config`
- [ ] The icon module (`--use-icons-module`)
- [ ] Sliders and blocks, in the editor and on the front end
- [ ] `chisel create --devcontainer`, if you use it

## 8. Release

- Update the theme version in `style.chisel-tpl.css` and `package.chisel-tpl.json`.
- Add a changelog note with what existing projects need to do (see step 9).
- Merge into `v2` only when you're ready to publish in the same sitting.
- Run `yarn lerna-version`, then `yarn lerna-publish`.
- PHP must be available, because publishing chisel-scripts fetches fresh copies of WP-CLI and Composer.
- If lerna 3 fails on Node 26, publish from Node 24. The published packages are the same either way.

## 9. Update an existing project as a pilot

Use `rfs-wp-chisel` first, then write down the steps for other projects. `update-chisel` only updates core files and the version number, so package changes are manual.

- Change `.nvmrc` to 26.13.0.
- Run `npm install` once on Node 26. Until the lockfile is regenerated, `npm ci` fails on Node 26's npm.
- Update wp-scripts to 37 together with Node, because wp-scripts 36+ doesn't support 24.11.1.
- Update Swiper and check the sliders.
- ESLint 8 and Stylelint 16 can stay for now, as both ran fine on Node 26.

Keep an eye on this: npm 11.20 warns that 5 packages have install scripts that aren't approved yet, including `@xfive/chisel-ai-toolkit`. They still ran in my tests, but the toolkit relies on its script to set itself up, so check it if npm starts blocking them.

---

# Release 2: Chisel's own old packages

These aren't needed for Node 26, as the old versions ran fine. Most of the newest versions only support modern `import` code, so each one needs code changes. Do them one at a time, and retest after each.

| Package | Now | Latest | Work needed |
|---|---|---|---|
| `inquirer` | 7 | 14 | **Do first.** Removes one of the two high security issues left after Release 1. Used for the prompts in `wp-config` and the generator |
| `fs-extra` | 9 | 11 | Should be simple, as it still supports `require` |
| `chokidar` | 3 | 6 | No longer supports file patterns, so the style and icon watchers need rewriting |
| `svgo` | 3 | 4 | Used by the icon module. Compare the generated icons before and after |
| `commander` | 5 | 15 | chisel-scripts relies on a private internal (`_actionResults`), and command handling has changed |
| `execa` | 4 | 10 | The way commands are run in chisel-shared-utils needs changing |
| `chalk` | 4 | 6 | Imports change |
| `globby` | 11 | 16 | Remove it from chisel-scripts, which doesn't use it. chisel-shared-utils and the generator need the upgrade |
| `update-notifier` | 4 | 7 | Generator only |
| `tinyqueue` | 2 | 3 | Generator only |
| `json2php` | 0.0.9 | 0.0.12 | Small update |

Cleanup at the same time:

- Remove `command-exists`. It's only used by code that never runs, because `hasYarn()` always returns false.
- Declare `copy-webpack-plugin` properly. chisel-scripts uses it without listing it, and it only works because wp-scripts installs it.
- Leave the repo's own tools (lerna 3, ESLint 7, Prettier 2) until last, and update them sooner only if they get in the way.

## Not included

PHP packages (`timber/timber ^2.5`, `php ^8.2`) aren't part of this plan.
