# Changelog

## v0.9.0 (25/10/2017)
- [**enhancement**] When running Chisel check if it is up to date #298
- [**enhancement**] Update link in the readme in generated project to link to specific version #297
- [**enhancement**] Save Chisel version used to generate project in .yo-rc.json #296
- [**documentation**] Update wiki pages to reflect change from .dev to .test [#293](https://github.com/xfiveco/generator-chisel/issues/293)
- [**enhancement**] Fix wp_title in base.twig [#284](https://github.com/xfiveco/generator-chisel/issues/284)
- [**enhancement**] Review Chisel/WpExtensions.php [#281](https://github.com/xfiveco/generator-chisel/issues/281)
- [**enhancement**] Change author's name suggestion to the user name [#268](https://github.com/xfiveco/generator-chisel/issues/268)
- [**enhancement**] Add Media class to Chisel namespace in WP for various media adjustments [#265](https://github.com/xfiveco/generator-chisel/issues/265)
- [**enhancement**] Switch to yeoman-generator 2.0 [#262](https://github.com/xfiveco/generator-chisel/issues/262)
- [**enhancement**] Change .dev to .test [#261](https://github.com/xfiveco/generator-chisel/issues/261)
- [**enhancement**] Remove get_ from twigs wherever possible [#257](https://github.com/xfiveco/generator-chisel/issues/257)
- [**enhancement**] Add doctoc as devDependency and add script to generate TOC in README.md [#256](https://github.com/xfiveco/generator-chisel/issues/256)
- [**documentation**] Documented assetPath function [#242](https://github.com/xfiveco/generator-chisel/issues/242)
- [**enhancement**] Provide functionality for web fonts loading [#233](https://github.com/xfiveco/generator-chisel/issues/233)
- [**documentation**] Create guide for using plugins which don't have npm version [#173](https://github.com/xfiveco/generator-chisel/issues/173)

---

## v0.8.0 (21/09/2017)
- Adding option to select how much ITCSS styling should be included (#182)
- Adding JavaScript vendor concatenation (#185)
- Using native font stack (#232)
- Cleaning dist folder on build (#236)
- Adding Performance class which allows to setup which JS scripts should be deferred or asynced (#238)
- Allowing to register Twig tests (#247)
- Updating stylelint config
- Setting proper path for extending tease.twig (#252)
- Switching to the original gulp-twig package (#253)
- Moving scripts to head (#258)
- Adding unminified versions of styles and scripts to dist (#259)
---

## v0.7.1 (27/07/2017)
- temporary reverting gulp-stylelint to previous version, fixes #229 (#230)
---

## v0.7.0 (21/07/2017)
- Added support for local `.yo-rc.json` (#204)
- Chisel starter theme improvements - reorganizing things to the Chisel namespace classes for easier updates and adding new functionality, see [Developing theme functionality](https://github.com/xfiveco/generator-chisel#developing-theme-functionality) (#206)
- Replacing deprecated `selector-no-id` with `selector-max-id` in stylelint config (#217)
- Improving default WordPress security settings (#220)
- Updating dependencies (#223)
- README updates (#226)
- Added wiki page [Setting up WordPress projects at Getfives](https://github.com/xfiveco/generator-chisel/wiki/Setting-up-WordPress-projects-at-Getfives)
---

## v0.6.4 (06/06/2017)
- Select ES6 by default during project scaffolding (#188)
- Use .babelrc for configuring babelify (#190)
- Changed Timber core classes names to current convention (#197)
- Coding style improvements in theme functions.php (#197)
- Creating proper camel case project name (#196)
- Limit characters allowed in project slug (#192)
- Documenting where to change some Browsersync config (#186)
- Adding linting for generator itself and fixing linting errors (#194)
- Adding npm lockfile

---

## v0.6.3 (15/05/2017)
- increasing serve performance (#176)
- improve watch mode performance (#181)
- allowing to choose port for connecting to DB during project setup (#180)
- adding `vendor` directory to `scripts` and `styles`, excluding them from linting (#178)
- fixing that project folder with number in name didn't match the project slug (#184)
---

## v0.6.2 (06/04/2017)
- use npm scripts instead of calling gulp directly (#169)
- add className function (#171)
- add ignore for VS editor files and local "dist (#170)
- new Chisel tutorial - [Easy-to-use Code Blocks in WordPress](https://www.xfive.co/blog/easy-use-code-blocks-wordpress/)
---

## v0.6.1 (29/03/2017)
- Stylelint adjustments (#154) 
- Use yarn as install method if available (#159)
- Disable BrowserSync synchronization of scroll and clicks
- Add autoprefixer to watch
- Bump dependencies of generated projects (#165)
- Update breakpoints (#166)
- Fix creation of WordPress projects with src directory inside theme (#168)
- removing Adminer from the plugins list as it's no longer listed in the WordPress plugins directory

---

## v0.6.0 (15/02/2017)
- ITCSS improvements and automatic style guide generation - added new elements, objects and sample components
- default styles for WP projects - editor content, posts, comments, main navigation, etc. allows quicker prototyping themes
- removed compilation of prefixed templates (eg. _template.twig_), now only top level templates compile to pages
- added option to move src folder to theme folder on WP projects during project setup
- added welcome screen to generator
- WP table prefix is made lowercase
- fixing JS error on WP projects (from the sample module)
- fixing broken WP screenshot
- migrating to Yeoman 1.0
- resolving styling deprecation warnings
- [An MVC-like WordPress Development with ACF and Timber](https://www.xfive.co/blog/mvc-like-wordpress-development-acf-timber/) - a blog post showing a sample project which uses Chisel for development 

---

## v0.5.1 (24/01/2017)
- Introduced revisionedPath and change behaviour of assetPath (#127)
- Used hash of project name slug as table name prefix in WP projects
- Added no-undef rule to ESlint 
- Support browser globar variables 
- Remove template related things on WordPress projects
- Allow manual modification of Browsersync proxy URL
- Updating docs with explanation how to use jQuery plugins with Browserify

---

## v0.5.0 (28/11/2016)
- Replacing Composer with WP-CLI (it’s a part of Chisel so no additional install is necessary)
- automatic WordPress setup and installation from command line
- pages generator works in WordPress projects too
- default project name based on the project directory name
- default author set to Xfive
- clearfix extend replaced with mixin 

---

## v0.4.0 (11/11/2016)
- syncing front-end and WordPress Twig templates (#97)
- Chisel starter theme consistency improvements (indentation, automatically generated theme name and author, correct package information)
- added project type question
- provided way to move `src` folder to theme folder
- Twig templates stored in subfolders are not built as separate pages in front-end projects
- newly created pages are added to the end of list on the project index (#83)
- using different plugin for Sass glob (#79)
- significant rewrite and update of Chisel documentation in README
- added wiki page for wildcard virtual host and DNS setup

---

## v0.3.1 (02/11/2016)
This is a patch release. 
- Remove `.git` directory from theme folder (#96)

---

## v0.3.0: WordPress support (02/11/2016)
Notable changes and features:
- WP support (#81, #80, #74, #70, #59), thanks @jakub300 and welcome to the team!
- Loosening ESLint rules enhancement (#78) 
- Base our Stylelint config on external standard enhancement (#47)
- Tons of bugfixes in development workflow

---

## v0.2.2 (19/09/2016)
- HTML validation with [gulp-htmlhint](https://github.com/bezoerb/gulp-htmlhint)
- Watchify errors handling, see #34 

---

## v0.2.1 (24/08/2016)
- making the project index font size smaller

---

## v0.2.0 (24/08/2016)
- new project index design
- excluding private (prefixed with \_) templates from rendering to HTML, see #32

---

## v0.1.6 (17/08/2016)
-  fixing problems with forcing Unix newlines on binary files, eg. font files or PNGs, see #30

---

## v0.1.5 (12/08/2016)
- Fixes #19 - adding stylelint - CSS linting task and configuration
- Fixes #29 - adding Twig templates base path
- improving editorconfig template

---

## v0.1.4 (08/08/2016)
- listing page sub generator in `package.json`

---

## v0.1.3 (08/08/2016)
- Fixes #23 – properly handle assets adding
- Fixes #24 – support ES6 modules syntax in ESLint

---

## v0.1.2 (28/07/2016)
- updated EsLint configuration
- dist folder added to git ignored by default
- removed .bowerrc as Bower is not used for now

---

## v0.1.1 (27/07/2016)
- Adding project name and author to main.scss
- Adding project and author info to app.js
- Adding page name to newly created pages
- New tests

---

## v0.1.0 (26/07/2016)
Initial release
