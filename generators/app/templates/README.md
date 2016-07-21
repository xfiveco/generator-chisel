# Chisel Sample Project

## Features
- Browsersync
- Twig templating
- SCSS with optional ITCSS structure
- Browserify with Watchify
- optional jQuery
- [gulp-rev](https://github.com/sindresorhus/gulp-rev) support
- ESLint

## Workflow

### Get started

1. `npm install`

### Development
Run `gulp` to run dev server and watch tasks for styles, scripts and templates. 

During development `main.css` (unminified) and `bundle.js` are linked in HTML. This is achieved by custom Twig function `assetPath` which updates assets path depending on whether the watch or build tasks are running.

### Build with files revisions

Run `gulp build` to build all files and create new revisions of styles and scripts using `gulp-rev`.

When `gulp build` is run, first the `dist` folder is cleaned and then build tasks are run in particular order:

1. `styles-build` builds prefixed and minified styles and creates a stylesheet revision by appending content hash to the filename. Then it creates `rev-manifest.json` with original and revisioned file names
2. `lint` runs EsLint
3. `scripts-build` runs Browserify bundler and creates `bundle.js` revision by appending content hash to the filename. Then it updates existing `rev-manifest.json` with the original and revisioned filename.
4. Finally, `templates-build` reads the newly created `rev-manifest.json` and builds HTML files from Twig templates, while linking revisioned files using the `assetPath` function.

