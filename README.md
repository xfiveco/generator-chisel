# Chisel [![Build Status](https://travis-ci.org/xfiveco/generator-chisel.svg?branch=master)](https://travis-ci.org/xfiveco/generator-chisel) [![NPM version](https://badge.fury.io/js/generator-chisel.svg)](https://badge.fury.io/js/generator-chisel) [![NPM dependiencies](https://david-dm.org/xfiveco/generator-chisel.svg)](https://david-dm.org/xfiveco/generator-chisel)

> Chisel is a [Yeoman](http://yeoman.io) generator for setting up and developing front-end and WordPress projects.

[![NPM](https://nodei.co/npm/generator-chisel.png)](https://nodei.co/npm/generator-chisel/)

![Project index](docs/img/project-index.jpg)

## Table of contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Features](#features)
  - [Front-end projects](#front-end-projects)
  - [WordPress projects](#wordpress-projects)
- [Installation](#installation)
  - [Node.js](#nodejs)
  - [Yeoman, Chisel](#yeoman-chisel)
  - [Apache, PHP and MySQL](#apache-php-and-mysql)
  - [Wildcard virtual hosts and DNS (optional)](#wildcard-virtual-hosts-and-dns-optional)
- [Project setup](#project-setup)
  - [Front-end projects](#front-end-projects-1)
    - [1. Create project directory](#1-create-project-directory)
    - [2. Run Chisel](#2-run-chisel)
    - [3. Setting up an existing project](#3-setting-up-an-existing-project)
  - [WordPress projects](#wordpress-projects-1)
    - [1. Create project directory](#1-create-project-directory-1)
    - [2. Run Chisel](#2-run-chisel-1)
    - [3. Set up virtual host (optional)](#3-set-up-virtual-host-optional)
    - [4. Setting up an existing project](#4-setting-up-an-existing-project)
- [Project structure](#project-structure)
  - [Front-end projects](#front-end-projects-2)
  - [WordPress projects](#wordpress-projects-2)
    - [Local WordPress configuration](#local-wordpress-configuration)
    - [Moving src folder to theme folder](#moving-src-folder-to-theme-folder)
- [Front-end development](#front-end-development)
  - [Adding pages](#adding-pages)
  - [Development tasks](#development-tasks)
  - [Caveats](#caveats)
    - [Using jQuery plugins with Browserify](#using-jquery-plugins-with-browserify)
    - [Library not available through npm](#library-not-available-through-npm)
- [WordPress development](#wordpress-development)
  - [Adding pages](#adding-pages-1)
  - [Development tasks](#development-tasks-1)
  - [Creating front-end](#creating-front-end)
  - [Developing theme functionality](#developing-theme-functionality)
    - [Built-in extensions for Timber](#built-in-extensions-for-timber)
    - [Good practices](#good-practices)
    - [Security](#security)
- [Tutorials](#tutorials)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

Chisel allows to create 2 projects types - front-end and WordPress projects with front-end.

### Front-end projects
- [Gulp](http://gulpjs.com/) build system
- [Browsersync](https://www.browsersync.io/)
- [Twig](http://twig.sensiolabs.org/) templating engine
- SCSS with [ITCSS architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
- [Browserify](http://browserify.org/) with Watchify
- [gulp-rev](https://github.com/sindresorhus/gulp-rev) support
- [stylelint](http://stylelint.io/)
- [ESLint](http://eslint.org/)
- HTML validation with [htmlhint](https://github.com/bezoerb/gulp-htmlhint)
- optional ES2015 with [Babel](https://babeljs.io/)
- optional jQuery

### WordPress projects

WordPress projects include all features of front-end projects plus:
- automatic [WP-CLI](http://wp-cli.org/) based WordPress and plugins installation
- automatic [Timber](http://upstatement.com/timber/) library installation to support Twig templates
- Chisel starter theme with the same workflow as for front-end projects
- WordPress pages generation from command line

## Installation

The following software needs to be installed if you want to setup and develop projects with Chisel. These installations need to be done just once so you can skip this section if you have the software already installed.

### Node.js
Install [Node.js](http://nodejs.org/) so you can work with `npm`, Node package manager. Version 4.5+ is required.

### Yeoman, Chisel
Install [Yeoman](http://yeoman.io/) and Chisel globally.

```bash
npm install -g yo generator-chisel
```

If you want to update your existing Chisel installation to the latest version, run:

```bash
npm update -g generator-chisel
```

### Apache, PHP and MySQL
If you want to develop WordPress projects, you need to install Apache, PHP and MySQL. The easiest option is to use development environments like [MAMP](https://www.mamp.info/en/) or [XAMPP](https://www.apachefriends.org) but you can also customize your [development environment on Mac](https://mallinson.ca/osx-web-development/).

Chisel is using [WP-CLI](http://wp-cli.org/) for most WP-related operations. WP-CLI is using `mysql` and `mysqlcheck` binaries, so you need to have `mysql` and `mysqlcheck` binaries in your `$PATH`.

### Wildcard virtual hosts and DNS (optional)
This step is optional but highly recommend if you develop WordPress projects. It will ensure that each new local development domain will work out of box on your computer and you won’t have to edit `hosts` and `httpd-vhosts.conf` files every time. This is achieved by setting up wildcard virtual hosts and DNS.

For detailed instructions how to set this up for your OS check out our [wiki page](https://github.com/xfiveco/generator-chisel/wiki/Wildcard-virtual-hosts-and-DNS).

## Project setup
### Front-end projects
#### 1. Create project directory
Create new project directory and change your working directory to it:

```bash
mkdir project-name && cd $_
```

#### 2. Run Chisel
Run Chisel from the project directory

```bash
yo chisel
```

Insert project name (you can use the default one based on the working directory name), author and select *Front-end only* project type. Select additional front-end features if you need them and wait until installation is complete.

*Note: To speedup installation process we recommend using [Yarn](https://yarnpkg.com/en/). Chisel will automatically detect it and run if possible. Otherwise it falls back to default NPM install*

#### 3. Setting up an existing project
If you are joining development of an existing front-end project which was already set up with Chisel, you don't have to set it up again. Follow these steps:

1. Clone repository
2. Run `npm install` or `yarn`
3. Run `npm run build` and `npm run dev`

### WordPress projects
#### 1. Create project directory
Create new project directory and change your working directory to it:

```bash
mkdir project-name && cd $_
```

#### 2. Run Chisel
Run Chisel from the project directory

```bash
yo chisel
```

Insert project name (you can use the default one based on the working directory name), author and select *WordPress with Front-end* project type. Select additional front-end features if you need them.

*Note: To speedup installation process we recommend using [Yarn](https://yarnpkg.com/en/). Chisel will automatically detect it and run if possible. Otherwise it falls back to default NPM install*

Setup your WordPress as follows:

- *Enter title for the new site*: title of your WordPress website
- *Enter URL*: the URL at which your WordPress project runs, currently Chisel only works with the default value
- *Enter admin user*: WordPress admin user, a different name than `admin` is suggested to increase security
- *Enter admin password*: WordPress admin user password
- *Enter admin email*:
- *Where do you want to place the 'src' folder*: position of the src folder with styles, scripts and assets - either the root folder or theme folder
- *Enter the database host*: `127.0.0.1`
- *Enter the database port*: `3306`
- *Enter the database name*: the project database name
- *Enter the database user*: user who can access the database
- *Enter the database password*: password for the user

Select optional plugins which should be installed from the list and wait until installation is complete.

#### 3. Set up virtual host (optional)
We recommend setting up [wildcard virtual hosts and DNS](https://github.com/xfiveco/generator-chisel/wiki/Wildcard-virtual-hosts-and-DNS) so your project domain works out of box.

If you haven’t set them up, you will have to add project domain to your `hosts` file

```
127.0.0.1 project-name.dev
```

Then use automatically generated `dev-vhost.conf` and add it to the Apache `httpd-vhosts.conf` file or add

```
IncludeOptional /path/to/projects/*/dev-vhost.conf
```

in your Apache configuration to automatically load configuration for multiple projects.

#### 4. Setting up an existing project
If you are joining development of an existing WordPress project which was already set up with Chisel, you don't have to set it up again. Follow these steps:

1. Clone the repository
2. Create database
3. Run `yo chisel:wp-config`, it will create _wp-config-local.php_ and generate _dev-vhost.conf_ (if you need it)
4. Run `npm install` or `yarn` and `npm run build`
5. Import DB dump or enable _WP Sync DB_ plugin and use it to import database and files. Check out the wiki page explaining how you case [use WP Sync DB plugin to migrate database](https://github.com/xfiveco/generator-chisel/wiki/Setting-up-WordPress-projects-at-Getfives).

## Project structure
Before starting actual development get familiar with the project structure generated by Chisel.

### Front-end projects
The file structure in front-end projects looks like this:

- **dist** - distribution files are automatically generated here, this is where you check your work in a browser.
- **gulp** - Gulp tasks configuration
- **node_modules** - Node.js modules for various Gulp tasks, usually you don’t have to do anything about this folder
- **src** - source files, development is done here
  - **assets** - static asset files (images, videos, fonts, etc.) - everything from this directory will be copied to dist folder
  - **styles** - Sass files with [ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) structure
    - `main.scss` - main file where other stylesheets are imported, do not write styles directly to this file
    - **settings** – used with preprocessors and contain font, colors definitions, etc.
    - **tools** – globally used mixins and functions. It’s important not to output any CSS in the first 2 layers.
    - **generic** – reset and/or normalize styles, box-sizing definition, etc. This is the first layer which generates actual CSS.
    - **elements** – styling for bare HTML elements (like H1, A, etc.). These come with default styling from the browser so you can redefine them here.
    - **objects** – class-based selectors which define undecorated design patterns, for example media object known from OOCSS
    - **components** – specific UI components. This is where majority of your work takes place and our UI components are often composed of Objects and Components
    - **utilities** – utilities and helper classes with ability to override anything which goes before in the triangle, eg. hide helper class
  - **scripts**
    - `app.js` - main JavaScript application file where other modules are imported
    - `greeting.js` - a sample JS module, delete or replace this one with your functionality
  - **templates** - Twig templates
    - `layouts/base.twig` - base layout which is extended in other templates
    - `layouts/page.twig` - a template from which the other pages are generated
    - `*.twig` - separate twig page templates
- **index** - images and styles for the project index
- `.babelrc` - Babel configuration file
- `.editorconfig` - [EditorConfig](http://editorconfig.org/) configuration file to achieve consistent coding style
- `.eslintignore` - [ESLint](http://eslint.org/) ignore file
- `.eslintrc.yml` - [ESLint](http://eslint.org/) configuration file to achieve consistent JavaScript coding style (you can update it to your preference)
- `.gitattributes` - [Git](http://git-scm.com/) configuration file to force Unix line ending in text files
- `.gitignore` - default Git ignore files and folders
- `.htmlhintrc` - [HTMLHint](https://github.com/yaniswang/HTMLHint) configuration file
- `.stylelintignore` - [stylelint](http://stylelint.io/) ignore file
- `.stylintrc.yml` - [stylelint](http://stylelint.io/) configuration file to achieve consistent CSS coding style (you can update it to your preference)
- `.yo-rc.json` - Yeoman generator configuration file
- `index.html` - project index with project pages listed
- `gulpfile.js` - Gulp configuration file
- `package.json` - project metadata and dependencies
- `README.md` - project readme, you can use it for the project documentation

On a typical project, you will work in `src` folder and check your work in `dist` folder so you don’t have to touch other files.

### WordPress projects
File structure in WordPress projects is almost identical to the front-end projects with the following differences:

- **~~dist~~** - dist folder is moved to the theme folder (see below)
- **src**
  - **~~templates~~**  - templates are stored in the templates directory inside the theme directory because they are interpreted dynamically by WordPress and Timber, not build by Gulp like in non-WP projects
- **~~index~~** - project index files are not used
- ~~index.html~~ - project index is not used
- **wp** - WordPress installation
  - **wp-content**
    - **themes**
      - **your-theme**
        - **dist** - dist folder where CSS, JS and assets files are built
        - **Chisel** - various classes used to extend or add new functionality to your theme
        - **templates** - Twig templates
        - `index.php` - Chisel starter theme files
        - `functions.php`
        - `etc.`
  - **wp-admin**
  - **wp-includes**
  - `wp-config-local.php` - your local WordPress configuration file (see below)
- `dev-vhost.conf` - automatically generated virtual host configuration (not needed if you use wildcard virtual hosts)

#### Local WordPress configuration
WordPress `wp-config.php` file is altered to provide support for local configuration. All settings except Authentication Unique Keys and Salts, database charset and ABS_PATH can be set in `wp-config-local.php` file for purposes of local development. The file is added automatically to `.gitignore` and should not be committed and stored on the production server.

If there is `wp-config-local.php` file available in main WordPress directory then the environment is recognized as local and configuration from this file is used. If it doesn't exist then settings from `wp-config.php` are used.

#### Moving src folder to theme folder

If you prefer having the `src` folder in your theme folder, choose this option when setting up the project. If you haven't and would like to move it manually, follow these steps:

1. Move the `src` folder to the theme folder - `wp/wp-content/themes/your-theme`
2. Change `chisel.src.base` property on line 13 in `package.json` to `wp/wp-content/themes/your-theme/src`

## Front-end development

### Adding pages
Once your project is setup, you need to add pages you will be working on to it. From the command line type:

```bash
yo chisel:page "Page Name"
```

for example

```bash
yo chisel:page "Home"
```

You can also create multiple pages at once by separating page names with space:

```bash
yo chisel:page "Home" "About Us" "Contact Us" "News"
```

### Development tasks
When you have the basic setup done, you can start development. To re-compile Twig, SCSS and JavaScript files in real time you can use default task. Type

```bash
npm run dev
```

and this will start a task that will watch for changes in files and recompile them as needed.

Additionally, development server will be started and Browsersync scripts injected. If you'd like change Browsersync configuration, you can do so in `gulp/tasks/serve.js`, for example here we've changed notifications and browser opening:

```js
    var browserSyncConfig = {
      server: './',
      ghostMode: false,
      online: true,
      notify: false, // Don't show any notifications in the browser.
      open: false // Stop the browser from automatically opening
    }
```

During development `main.css` (unminified) and `bundle.js` are linked in HTML. This is achieved by custom Twig function `revisionedPath` which updates assets path depending on whether the watch or build tasks are running.

To rebuild the whole project and create new revisions of styles and scripts using `gulp-rev`, use the build task again

```bash
npm run build
```

When `npm run build` is run, first the `dist` folder is cleaned and then build tasks are run in particular order:

1. `styles-build` builds minified styles and creates a stylesheet revision by appending content hash to the filename. Then it creates `rev-manifest.json` with original and revisioned file names
2. `lint` runs EsLint
3. `scripts-build` runs Browserify bundler and creates `bundle.js` revision by appending content hash to the filename. Then it updates existing `rev-manifest.json` with the original and revisioned filename.
4. Finally, `templates-build` reads the newly created `rev-manifest.json` and builds HTML files from Twig templates, while linking revisioned files using the `revisionedPath` function.

### Caveats

#### Using jQuery plugins with Browserify

One of the known issues we encounter while front-end development is usage of jQuery plugins like `flexslider` alongside Browserify module bundler.

The usual solution to that problem can be treated this way:

  1. Install `jquery` node-module if you haven't done it yet. This is needed because many jQuery plugins have a check if they run inside a module bundler and require `jquery` to be a node-module, but they tend to bind themselves to global `$` object either way.
  ```
  npm install --save jquery
  ```

  1. Make jQuery global (for various reasons)
  ```js
  window.jQuery = window.$ = require('jquery');
  ```

  1. Require plugin
  ```js
  require('flexslider'); // Usually they bind to global jQuery object
  ```

#### Library not available through npm

Use [`browserify-shim`](https://github.com/thlorenz/browserify-shim#you-will-always).

## WordPress development

### Adding pages

You can use `yo chisel:page` command to add pages to your WordPress project in the same way as you do in front-end projects.

- Twig template is automatically created in `wp/wp-content/themes/[your-theme]/templates/page-{page-slug}.twig`
- Page is accessible at `project-name.dev/{page-slug}`

### Development tasks
To re-compile SCSS and JavaScript files in real time you can use default task. Type:

```bash
npm run dev
```

and this will start a task that will watch for changes in files and recompile them as needed.

Additionally, development server will be started and Browsersync scripts injected. Browsersync proxies to your WordPress instance running at `project-name.dev`.

Depending on where you are looking at your project, different version of styles and scripts are used:

- `localhost:3000` - unminified CSS
- `project-name.dev` - revisioned and minified CSS and JS files

To create new revisions of styles and scripts using [gulp-rev](https://github.com/sindresorhus/gulp-rev), use the build task:

``` bash
npm run build
```

### Creating front-end
Chisel allows easy front-end development prior to WordPress development. Suppose you have 3 pages to develop front-end for `Team`, `Team Member`, `Contact`.

1. Add these pages from the command line like described in the previous sections
2. Now your pages are accessible under `project-name.dev/team/`, `project-name.dev/team-member/` and `project-name.dev/contact/`.
3. Start adding HTML to relevant Twig templates. Where applicable try to use [Twig syntax](http://twig.sensiolabs.org/doc/templates.html)
4. Create styles in `src/styles`.
5. Once you are done with front-end development a WordPress developer will add required functionality

### Developing theme functionality

Inside the theme there is `Chisel` folder with various classes which extend WordPress or add theme functionality. It's recommended to follow the existing structure and update these classes or add new classes here instead of adding functionality directly to `functions.php`.

Classes you can work with:

- `\Chisel\WpExtensions` - use this class to extend Wordpress (register post types, taxonomies, etc.)
- `\Chisel\Security` - default security settings for Chisel, you can change or extend security settings here.

Classes you usually don't have to touch:

- `\Chisel\Site` - this class extends `\Timber\Site` class and is used to setup whole site
- `\Chisel\Post` - this class extends `\Timber\Post` class
- `\Chisel\TwigExtensions` - this class is used to extend Twig

If you want to add new custom class, you can copy and adjust one of the existing classes. Then load your class in `functions.php`

Refer to [Timber](http://upstatement.com/timber/) documentation if you are new to WordPress development with Timber.

#### Built-in extensions for Timber

* `ChiselPost`: you can use this function if you want to create a post class inside Twig file. As an argument you can pass post id, post object, or an array consisting of field values for the post. When creating fake post by passing an array of fields as an argument you can use `_fields` key to set post meta values loaded via `get_field` method to simulate for example ACF values. You can also load existing post that will have fake fields by passing post's id with `ID` key:

  Example usage:
  
  ```php
  {% set post = ChiselPost({
    'post_title': 'Fake post title',
    'post_content': 'Fake post content',
    '_fields': {
      'special_acf_field': 'field value'
    }
  }) %}
  ```
  
  This will create a `\Chisel\Post` object that you can use like any other post loaded from the database:
  
  ```html
  <div>
    <h1>{{ post.title }}</h1>
    <p>{{ post.content }}</p>
    <p>{{ post.get_field('special_acf_field') }}</p>
  </div>
  ```

* `className`: you can use this function if you want to avoid writing long classes with multiple modifiers by hand:

  Example usage:
  
  ```php
  <article class="{{
    className(
      'c-some-post',
      'red',
      'type-' ~ post.type,
      (post.thumbnail ? 'has-thumbnail')
    )
  }}"></article>
  ```
  
  It will generate (assuming post of type `post` and no thumbnail):

  ```html
  <article class="c-some-post c-some-post--red c-some-post--type-post"></article>
  ```

#### Good practices

* Try to always use `get_field` method of `Chisel\Post` instead of direct call to the field:
  
  Good:
  ```html
  {{ post.get_field('field_name') }}
  ```
  
  Bad:
  ```html
  {{ post.field_name }}
  ```

#### Security

In addition to default security settings you can also:

* Protect WP includes

  Add `.htaccess` to the `wp-includes` folder with the following content:

  ```
  <FilesMatch "\.(?i:php)$">
    Order allow,deny
    Deny from all
  </FilesMatch>
  <Files wp-tinymce.php>
    Allow from all
  </Files>
  <Files ms-files.php>
    Allow from all
  </Files>
  ```

* Protect uploads folder

  Add `.htaccess` to the `wp-content/uploads` folder with the following content:

  ```
  <FilesMatch "\.(?i:php)$">
    Order allow,deny
    Deny from all
  </FilesMatch>
  ```

  Note: this can break some plugins

## Tutorials
- [Craft perfect websites with Chisel](https://www.xfive.co/blog/craft-perfect-websites-chisel/)
- [An MVC-like WordPress Development with ACF and Timber](https://www.xfive.co/blog/mvc-like-wordpress-development-acf-timber/)
- [Easy-to-use Code Blocks in WordPress](https://www.xfive.co/blog/easy-use-code-blocks-wordpress/)

## License
Chisel is licensed under [MIT License](LICENSE).
