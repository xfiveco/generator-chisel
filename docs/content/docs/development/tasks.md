---
title: Tasks
excerpt: Development tasks are commands you use on the command line to start development.
order: 1100
---

Once you [setup project](/docs/setup) and get familiar with [project structure](/docs/structure), it's time to start development. To do so, use the following tasks on your **command line**.

## `npm run dev`

This is a basic command to work with Chisel. It starts a development server with your project at `localhost:3000` and opens the address in your browser.

The command then starts a task that watches for changes in your source files. This is what happens if you make changes in the following files:

- **Twig templates** are compiled to PHP on WordPress project or to HTML on front-end projects and browser reloads the page
- **Content files** are compiled to HTML using Twig templates, see [Static Content](/docs/development/static-content) for more details.
- **PHP files** - browser reloads the page
- **SCSS files** are compiled to CSS and browser injects new CSS to the page
- **JavaScript files** are transpiled with Babel and browser reloads the page

During development unminified version of files are linked in pages.

### Browsersync configuration (WordPress only)

If you'd like change Browsersync configuration, you can do so in `chisel.config.js`, for example here we've changed notifications and browser opening:

```js
{
  hooks: {
    wordPress: {
      browserSyncConfig(config) {
        // Stop the browser from automatically opening
        config.open = false;
        // Don't show any notifications in the browser
        config.notify = false;
      },
    },
  },
}
```

See [Hooks documentation](/docs/development/configuration/hooks) for more information.

### Proxy on WordPress projects

Browsersync proxies to your WordPress instance running at `project-name.test` (or other address configured during project creation), it means that when you look at the project at `localhost:3000`, it loads the project from `project-name.test`.

You can configure the url in `chisel.config.js` by changing `url` in `wp` variable.

```js
// ...
const wp = {
  // ...
  url: 'http://some-target:8888/',
};
// ...
```

If you don't want to commit your url to repository, you can also create `chisel.config.local.js` file with similar content:

```js
module.exports = {
  wp: {
    url: 'http://some-target:8888/',
  },
};
```

## `npm run build`

This command lints (validates compliance with good practices) JS and SCCS files and then creates production-ready files in the `dist` folder.

Generated JS and CSS files are minified and JS, CSS and assets are revisioned. Revisioning files means that a content hash is append to the filename so it looks like this `main.6a889b04.css`. This way you can set up content caching in the far future.

In WordPress projects depending on where you are looking at your project, different version of styles and scripts are used in WordPress projects:

- `localhost:3000` - unminified CSS
- `project-name.test` - revisioned and minified CSS and JS files

## `npm run build-report`

This is special variant of build that additionally generated three files (`report-analyzer.html`, `report-source-map-scripts.html` and `report-source-map-styles.html`). that give you more insides to the size of generated files.

First one is generated with [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) and the other two are generated with [source-map-explorer](https://github.com/danvk/source-map-explorer). On the one hand WBA is working only with JS, on the other hand it provides more insides and more options when analyzing JS size. Because of that we decided to include both solutions.

## `npm run add-page`

See [Pages](./pages).
