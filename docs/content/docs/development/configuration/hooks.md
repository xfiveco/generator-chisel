---
title: Hooks
excerpt: Hooks are listeners to events happening inside Chisel allowing you to influence Chisel behavior in ways not possible with configuration options.
order: 1975
---

Please note that while list of available hooks is limited we're open to adding more when necessary.

## Shared (available in both WordPress and Static projects)

### `pluginsToInitialize(plugins)`

Called before plugins are initialized, allows you to modify the plugins that will be initialized.

### `pluginsInitialized`

Called after all plugins has been initialized.

## WordPress Websites

### `wordPress.devMiddlewareOptions(devMiddlewareOptions)`

Called during `dev` command, allows you to modify [webpack-dev-middleware options](https://github.com/webpack/webpack-dev-middleware#options).

### `wordPress.hotMiddlewareOptions(hotMiddlewareOptions)`

Called during `dev` command, allows you to modify [webpack-hot-middleware options](https://github.com/webpack-contrib/webpack-hot-middleware#middleware).

### `wordPress.browserSyncConfig(browserSyncConfig)`

Called during `dev` command, allows you to modify [BrowserSync options](https://www.browsersync.io/docs/options).

## Static Websites

Nothing at the moment.

## Example

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
