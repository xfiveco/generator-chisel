---
title: Configuration
order: 1950
---

## Paths

The paths used by Chisel by default are presented below, all can be updated in the configuration. All paths except for `base` are relative to base. `base` is relative to project root (current working directory is considered project root when running commands).

```js
{
  source: {
    base: 'src',
    scripts: 'scripts',
    styles: 'styles',
    assets: 'assets',
    templates: 'templates', // Static only
    content: '../content', // Static only
    public: '../public', // Static only
  },
  output: {
    base: 'dist',
    scripts: 'scripts',
    styles: 'styles',
    assets: 'assets',
  },
}
```

## Shared (available in both WordPress and Static projects)

<!-- ### `` -->

### `react`

`boolean = false`

Enables react support. When enabled in makes changes necessary to enable JSX processing (Babel), hot reload during development (Babel, webpack) and changes default eslint configuration to support and check react components.

Before enabling you should:

1. Install necessary dependencies (`npm install react-hot-loader @hot-loader/react-dom`)
1. Mark your root component as hot-exported as described in [react-hot-loader documentation](https://github.com/gaearon/react-hot-loader#getting-started)

### `plugins`

`(string|function)[] = []`

List of Chisel plugins to be loaded. This is array that may contain strings that are passed to `require()` so module names or paths to JS files (please use `require.resolve` to ensure path is properly resolved) or functions that are treated as plugins.

### `configureWebpack`

`object | function`

If the value is an Object, it will be merged into the final config using [webpack-merge](https://github.com/survivejs/webpack-merge).

If the value is a function, it will receive the resolved config as the argument. The function can either mutate the config and return nothing, OR return a cloned or merged version of the config.

See also: [Working with Webpack > Simple Configuration in Vue CLI documentation](https://cli.vuejs.org/guide/webpack.html#simple-configuration).

### `chainWebpack`

A function that will receive an instance of `ChainableConfig` powered by [webpack-chain](https://github.com/neutrinojs/webpack-chain). Allows for more fine-grained modification of the internal webpack config.

See also: [Working with Webpack > Chaining in Vue CLI documentation](https://cli.vuejs.org/guide/webpack.html#chaining-advanced).

### `hooks`

Hooks are advanced feature allowing you to influence Chisel behavior in ways not possible with configuration options. See [Hooks](./configuration/hooks) for details.

## WordPress Websites

<!-- ### `` -->

### `wp.directoryName`

`string = 'wp'`

Name of the directory containing WordPress files. Some situations like [serving website from subdirectory on Pantheon](https://pantheon.io/docs/nested-docroot) may require different directory name. Please note that aditionally you should adjust various ignore files (like `.eslintignore`) and WP CLI config (`wp-cli.yml`). Additionally please note that using non default value has not been well tested.

### `wp.themeName`

`required, string`

Name of the directory with your theme, default us `[project-slug]-chisel`.

### `wp.url`

URL when WordPress is reachable, this is used as proxy target during development, default is `http://[project-slug].test`.

## Static Websites

<!-- ### `` -->

### `staticFrontend.serveDist`

`boolean = false`

When enabled development server will serve dist directory, meaning that url for the page generated from `src/templates/hello.twig` template will be `http://localhost:3000/hello.html` instead of `http://localhost:3000/dist/hello.html`.

This is set to `true` when _Serve dist directory in dev / don't generate pages index_ option was selected during project creation.

### `staticFrontend.skipHtmlExtension`

`boolean = false`

When enabled:

- When using [content](/docs/development/static-content) `post.link` and `postLink` functions return links without HTML extensions.
- During development development server assumes that all URLs without extension are HTML files, for example `/hello` url will look for `/hello.html` file.

This is set to `true` when _Don't include html extension in links (posts API) & support them in dev_ option was selected during project creation.

### `staticFrontend.buildFormat`

`string = 'prettify': 'prettify' | 'minify' | 'as-is'`

Decide how generated HTML should be formatted. This is applied only during build, not development.

- `prettify` (default) - generated is nicely formatted, this is useful when generated files may be manually modified later.
- `minify` - generated HTML is minified, good to use when site is automatically deployed.
- `as-is` - no additional formatting is done, HTML generated during Twig processing is used.

### `staticFrontend.htmlHint`

`boolean = true`

You can enable or disable [HTML Hint](https://htmlhint.com/) validation here. Note that HTML Hint validation is run on generated html files during development/build not on the source files.

### `functions`

`{ [function name]: (functionContext, ...args) => any } = {}`

Object containing functions that will be available in Twig templates.

- Functions can be `async`.
- Functions receive `functionContext` object as first argument followed by arguments that were passed to the function. `functionContext` object contains two properties `context` that contains Twig Context (variables available inside Twig templates) and functions object that contains Chisel builtin functions that are available in Twig templates. `context` may contain `post` object when [using content directory](/docs/development/static-content). See config file for this documentation to see example of custom function (TODO: link after merged).
