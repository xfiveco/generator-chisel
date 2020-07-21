---
title: Tasks
excerpt: Development tasks are commands you use on the command line to start development.
order: 110
---

Once you [setup project](/docs/setup) and get familiar with [project structure](/docs/structure), it's time to start development. To do so, use the following tasks on your **command line**.

## `npm run dev`
This is a basic command to work with Chisel. It starts a development server with your project at `localhost:3000` and opens the address in your browser.

The command then starts a task that watches for changes in your source files. This is what happens if you make changes in the following files:

- **Twig templates** are compiled to PHP on WordPress project or to HTML on front-end projects and browser reloads the page
- **PHP files** - browser reloads the page
- **SCSS files** are compiled to CSS and browser injects new CSS to the page
- **JavaScript files** are transpiled with Babel and browser reloads the page

During development unminified version of files are linked in pages.

### Browsersync configuration
If you'd like change Browsersync configuration, you can do so in `gulp/tasks/serve.js`, for example here we've changed notifications and browser opening:

```js
var browserSyncConfig = {
  server: './',
  ghostMode: false,
  online: true,
  notify: false, // Don't show any notifications in the browser
  open: false // Stop the browser from automatically opening
}
```

### Proxy on WordPress projects
Browsersync proxies to your WordPress instance running at `project-name.test`, it means that when you look at the project at `localhost:3000`, it loads the project from `project-name.test`.

You can configure custom `proxyTarget` in `.yo-rc.json`:
```js
{
  "generator-chisel": {
    "config": {
      "name": "...",
      "author": "...",
      ...
      "proxyTarget": "http://some-target:8888/"
    }
  }
}
```

If you don't want to commit your `proxyTarget` to repository, you can also create file `.yo-rc-local.json` with similar content:

```js
{
  "generator-chisel": {
    "config": {
      "proxyTarget": "http://some-target:8888/"
    }
  }
}
```

## `npm run build`
This command is used to create production-ready files in the `dist` folder. These files are:

- minified
- revisioned 

Revisioning files means that a content hash is append to the filename so it looks like this `main-93d2daf7a3.css`. This way you can set up content caching in the far future.

Depending on where you are looking at your project, different version of styles and scripts are used in WordPress projects:

- `localhost:3000` - unminified CSS
- `project-name.test` - revisioned and minified CSS and JS files









