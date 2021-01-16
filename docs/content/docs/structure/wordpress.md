---
title: WordPress Website Structure
excerpt: WordPress website project generated by Chisel consists of the following folders and files
order: 800
---

## `node_modules`

[Node.js](https://nodejs.org/) modules for various project tasks.

## `src`

**This is where you do front-end development**. The project source files are organized in the following subfolders:

- `assets` - static asset files (images, fonts, etc.) - files from this folder can be used in styles (`url('~assets/path/to/file')`), JS (`import filePath from '~/assets/path/to/file`) or in Twig (`{{ assetPath('path/to/file') }}`),
- `scripts` - JavaScript files, check out [JavaScript documentation](/docs/development/javascript),
- `styles` - Sass files with ITCSS structure, check out [ITCSS documentation](/docs/development/itcss).

### Moving `src` folder to the theme folder

It's possible to have the `src` folder in your theme folder, follow these steps:

1. Move the `src` folder to the theme folder - `wp/wp-content/themes/your-theme-chisel`.
1. In `chisel.config.js` set `source.base` to `wp/wp-content/themes/your-theme-chisel/src`, see [Configuration](/docs/development/configuration) for more details.
1. You need to update ignore files (`.eslintignore`, `.prettierignore`, `.stylelintignore`). First remove slash from `/src/assets` so it works with assets in the theme, then to not ignore new `src` directory we need to recursively exclude our directory. In those files replace

   ```text
   /wp

   ```

   with

   ```text
   /wp/*
   !/wp/wp-content
   /wp/wp-content/*
   !/wp/wp-content/themes/
   /wp/wp-content/themes/*
   !/wp/wp-content/themes/[your-theme]-chisel
   /wp/wp-content/themes/[your-theme]-chisel/*
   !/wp/wp-content/themes/[your-theme]-chisel/src
   ```

## `wp`

This is where WordPress is installed.

## `wp/wp-config-local.php`

WordPress `wp-config.php` file is altered to provide support for local configuration. All settings except Authentication Unique Keys and Salts, database charset and ABS_PATH can be set in `wp-config-local.php` file for purposes of local development. The file is added automatically to `.gitignore` and should not be committed and stored on the production server.

If there is `wp-config-local.php` file available in this directory then the environment is recognized as local and configuration from this file is used. If it doesn't exist then settings from `wp-config.php` are used.

## `wp/wp-content/themes/your-theme-chisel`

**This is where you do theme development**. The theme folder includes Chisel starter theme with the following structure:

- `dist` - production ready files are automatically generated here.
- `Chisel` - various classes used to extend or add new functionality to your theme. Check out [WordPress development](/docs/development/wordpress)
- `templates` - Twig templates, check out [Twig documentation](/docs/development/twig)
- `functions.php`, `index.php` etc. - Chisel starter theme files

## Configuration files

Chisel uses various configurations files. Usually, it's not necessary to touch these files, unless stated otherwise.

- `.browserslistrc` - Supported browsers list used to generate only necessary normalization styles, JS transformations and (when enabled in `babel.config.js`) automatic polyfills
- `.editorconfig` - [EditorConfig](http://editorconfig.org/) configuration file to achieve consistent coding style
- `.eslintignore` - [ESLint](http://eslint.org/) ignore file
- `.eslintrc.js` - [ESLint](http://eslint.org/) configuration file to achieve consistent JavaScript coding style (you can update it to your preference)
- `.gitattributes` - [Git](http://git-scm.com/) configuration file to force Unix line ending in text files
- `.gitignore` - default Git ignore files and folders
- `.prettierignore` - [Prettier](https://prettier.io/) ignore file
- `.stylelintignore` - [stylelint](http://stylelint.io/) ignore file
- `babel.config.js` - [Babel](https://babeljs.io/) configuration file
- `chisel.config.js` - Chisel config file, see [Configuration](/docs/development/configuration) for more details
- `dev-vhost.conf` - automatically generated virtual host configuration (not needed if you use [wildcard virtual hosts](/docs/installation/wildcard-virtual-hosts))
- `package.json` - project metadata and dependencies
- `package-lock.json` - [npm lock file](https://docs.npmjs.com/files/package-locks), if you use npm
- `postcss.config.js` - [PostCSS](https://postcss.org/) config file
- `prettier.config.js` - [Prettier](https://prettier.io/) config file
- `README.md` - project readme; you can use it for the project documentation
- `stylelint.config.js` - [stylelint](http://stylelint.io/) configuration file to achieve consistent CSS coding style (you can update it to your preference)
- `wp-cli.yml` - [WP CLI](https://wp-cli.org/) configuration file
- `yarn.lock` - [Yarn lock file](https://yarnpkg.com/lang/en/docs/yarn-lock/), if you use Yarn