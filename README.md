# Chisel [![Build Status](https://travis-ci.org/xfiveco/generator-chisel.svg?branch=master)](https://travis-ci.org/xfiveco/generator-chisel) [![NPM version](https://badge.fury.io/js/generator-chisel.svg)](https://badge.fury.io/js/generator-chisel) [![NPM dependiencies](https://david-dm.org/xfiveco/generator-chisel.svg)](https://david-dm.org/xfiveco/generator-chisel)

> Chisel is a [Yeoman](http://yeoman.io) generator for setting up and developing front-end and WordPress projects.

[![NPM](https://nodei.co/npm/generator-chisel.png?downloads=true)](https://nodei.co/npm/generator-chisel/)

![Project index](docs/img/project-index.jpg)

## Table of contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Features](#features)
  - [Front-end projects](#front-end-projects)
  - [WordPress projects](#wordpress-projects)
- [Installation](#installation)
  - [Node.js](#nodejs)
  - [Yeoman, Gulp &amp; Chisel](#yeoman-gulp-amp-chisel)
  - [Apache, PHP and MySQL](#apache-php-and-mysql)
  - [Composer](#composer)
  - [Wildcard virtual hosts and DNS (optional)](#wildcard-virtual-hosts-and-dns-optional)
- [Project setup](#project-setup)
  - [Front-end projects](#front-end-projects-1)
    - [1. Create project directory](#1-create-project-directory)
    - [2. Run Chisel](#2-run-chisel)
  - [WordPress projects](#wordpress-projects-1)
    - [1. Create database](#1-create-database)
    - [2. Create project directory](#2-create-project-directory)
    - [3. Run Chisel](#3-run-chisel)
    - [4. Set up virtual host (optional)](#4-set-up-virtual-host-optional)
    - [5. Setup WordPress](#5-setup-wordpress)
- [Project structure](#project-structure)
  - [Front-end projects](#front-end-projects-2)
  - [WordPress projects](#wordpress-projects-2)
    - [Local WordPress configuration](#local-wordpress-configuration)
    - [Moving src folder to theme folder](#moving-src-folder-to-theme-folder)
- [Project development](#project-development)
  - [Front-end projects](#front-end-projects-3)
    - [1. Add pages](#1-add-pages)
    - [2. Develop](#2-develop)
  - [WordPress projects](#wordpress-projects-3)
    - [1. Add pages](#1-add-pages-1)
    - [2. Develop](#2-develop-1)
    - [3. Front-end first](#3-front-end-first)
    - [4. Develop with Timber](#4-develop-with-timber)
- [Credits](#credits)
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
- [Composer](https://getcomposer.org/) based WordPress and plugins installation
- Automatic [Timber](http://upstatement.com/timber/) library installation to support Twig templates
- Chisel starter theme with the same workflow as for front-end projects

## Installation

The following software needs to be installed if you want to setup and develop projects with Chisel. These installations need to be done just once so you can skip this section if you have the software already installed.

### Node.js
Install [Node.js](http://nodejs.org/) so you can work with `npm`, Node package manager. Version 4.5+ is required.

### Yeoman, Gulp &amp; Chisel
Install [Yeoman](http://yeoman.io/), [Gulp](http://gulpjs.com/) and Chisel globally.

```bash
npm install -g yo gulp-cli generator-chisel
```

### Apache, PHP and MySQL
If you want to develop WordPress projects, you need to install Apache, PHP and MySQL. The easiest option is to use development environments like [MAMP](https://www.mamp.info/en/) or [XAMPP](https://www.apachefriends.org) but you can also customize your [development environment on Mac](https://mallinson.ca/osx-web-development/).

### Composer
You will also need [Composer](https://getcomposer.org/) for setting up Wordpress projects with Chisel.

- [Installation - Linux / Unix / OSX](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-osx)
- [Installation - Windows](https://getcomposer.org/doc/00-intro.md#installation-windows)


Verify that your Composer installation is working properly:

```bash
composer -V
```

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

Insert project name, author and select *Front-end only* project type. Select additional features if you need them and wait until installation is complete.

### WordPress projects
#### 1. Create database
Start by creating a MySQL database for your WordPress project, you will use its name during the project setup with Chisel.

#### 2. Create project directory
Now create new project directory and change your working directory to it:

```bash
mkdir project-name && cd $_
```

#### 3. Run Chisel
Run Chisel from the project directory

```bash
yo chisel
```

Insert project name, author and select *WordPress with Front-end* project type. Select additional features if you need them.

Enter database details as follows:

- *Database host*: `localhost`
- *Database name*: the name of database you have created for the project
- *Database user*: user who can access the database
- *Database password*: password for the user

Select optional plugins which should be installed from the list and wait until installation is complete.

#### 4. Set up virtual host (optional)
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

#### 5. Setup WordPress

1. Go to `project-name.dev` and complete WordPress installation.
2. Login to WordPress admin, go to *Plugins* and **activate Timber plugin**
3. Go to *Appearance* and activate your project theme (the theme with the name of your project)

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
    - **trumps** – utilities and helper classes with ability to override anything which goes before in the triangle, eg. hide helper class
  - **scripts**
    - `app.js` - main JavaScript application file where other modules are imported
    - `greeting.js` - a sample JS module, delete or replace this one with your functionality
  - **templates** - Twig templates
    - `layouts/base.twig` - base layout which is extended in other templates
    - `_template.twig` - a template from which the other pages are generated
    - `*.twig` - separate twig page templates
- **index** - images and styles for the project index
- `index.html` - project index with project pages listed
- `package.json` - npm packages dependencies
- `.yo-rc.json` - Yeoman generator configuration file
- `.editorconfig` - [EditorConfig](http://editorconfig.org/) configuration file to achieve consistent coding style
- `.gitattributes` - [Git](http://git-scm.com/) configuration file to force Unix line ending in text files
- `.gitignore` - default Git ignore files and folders
- `.eslintrc.yml` - [ESLint](http://eslint.org/) configuration file to achieve consistent JavaScript coding style (you can update it to your preference)
- `.stylintrc.yml` - [stylelint](http://stylelint.io/) configuration file to achieve consistent CSS coding style (you can update it to your preference)

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
        - **templates** - Twig templates
        - `index.php` - Chisel starter theme files
        - `functions.php`
        - `etc.`
  - **wp-admin**
  - **wp-includes**
  - `wp-config-local.php` - your local WordPress configuration file (see below)
- `dev-vhost.conf` - automatically generated virtual host configuration
- `composer.json` - Composer configuration file

#### Local WordPress configuration
WordPress `wp-config.php` file is altered to provide support for local configuration. All settings except Authentication Unique Keys and Salts, database charset and ABS_PATH can be set in `wp-config-local.php` file for purposes of local development. The file is added automatically to `.gitignore` and should not be committed and stored on the production server.

If there is `wp-config-local.php` file available in main WordPress directory then the environment is recognized as local and configuration from this file is used. If it doesn't exist then settings from `wp-config.php` are used.

#### Moving src folder to theme folder

If you prefer having the `src` folder in your theme folder, you can move it there easily:

1. Move the `src` folder to the theme folder - `wp/wp-content/themes/your-theme`
2. Change `chisel.src.base` property on line 13 in `package.json` to `wp/wp-content/themes/your-theme/src`

## Project development

### Front-end projects

#### 1. Add pages
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

#### 2. Develop
When you have the basic setup done, you can start development. To re-compile Twig, SCSS and JavaScript files in real time you can use default task. Type

```bash
gulp
```

and this will start a task that will watch for changes in files and recompile them as needed. 

Additionally, development server will be started and BrowserSync scripts injected.

During development `main.css` (unminified) and `bundle.js` are linked in HTML. This is achieved by custom Twig function `assetPath` which updates assets path depending on whether the watch or build tasks are running.

To rebuild the whole project and create new revisions of styles and scripts using `gulp-rev`, use the gulp build task again

```bash
gulp build
```

When `gulp build` is run, first the `dist` folder is cleaned and then build tasks are run in particular order:

1. `styles-build` builds prefixed and minified styles and creates a stylesheet revision by appending content hash to the filename. Then it creates `rev-manifest.json` with original and revisioned file names
2. `lint` runs EsLint
3. `scripts-build` runs Browserify bundler and creates `bundle.js` revision by appending content hash to the filename. Then it updates existing `rev-manifest.json` with the original and revisioned filename.
4. Finally, `templates-build` reads the newly created `rev-manifest.json` and builds HTML files from Twig templates, while linking revisioned files using the `assetPath` function.

### WordPress projects

#### 1. Add pages

`yo chisel:page` command doesn't work on WordPress projects (yet). If you want to add a page to your WordPress projects, follow these steps:

1. Create a page in WordPress admin, eg. Team
2. Add a Twig template in `wp/wp-content/themes/[your-theme]/templates/page-{page-slug}.twig`, so in this case it would be `wp/wp-content/themes/[your-theme]/templates/page-team.twig`
3. Your page is now accessible at `project-name.dev/{page-slug}`, eg. `project-name.dev/team/`.

#### 2. Develop
To re-compile SCSS and JavaScript files in real time you can use default task. Type:

```bash
gulp
```

and this will start a task that will watch for changes in files and recompile them as needed. 

Additionally, development server will be started and BrowserSync scripts injected. BrowserSync proxies to your WordPress instance running at `project-name.dev`.

Depending on where you are looking at your project, different version of styles and scripts are used:

- `localhost:3000` - unminified and non-prefixed CSS
- `project-name.dev` - revisioned CSS and JS files (minified and prefixed)

To create new revisions of styles and scripts using [gulp-rev](https://github.com/sindresorhus/gulp-rev), use the gulp build task:

``` bash
gulp build
```

During development you should occasionally build your styles and scripts to see how the site works with minified and prefixed CSS.

#### 3. Front-end first
Chisel allows easy front-end development prior to WordPress development. Suppose you have 3 pages to develop front-end for `Team`, `Team Member`, `Contact`.

1. Add these pages in WordPress admin and create Twig templates for them as described in the previous section
2. Now your pages are accessible under `project-name.dev/team/`, `project-name.dev/team-member/` and `project-name.dev/contact/`.
3. Start adding HTML to relevant Twig templates. Where applicable try to use [Twig syntax](http://twig.sensiolabs.org/doc/templates.html)
4. Create styles in `src/styles`.  
5. Once you are done with front-end development a WordPress developer will add required functionality to the templates


#### 4. Develop with Timber
Refer to [Timber](http://upstatement.com/timber/) documentation if you are new to WordPress development with Timber.

## Credits
A lot of Chisel functionality is copied from or inspired by [Limelight Generator](https://github.com/piotrkulpinski/generator-limelight). Thanks, Piotrek ;)

## License
Chisel is licensed under [MIT License](LICENSE).
