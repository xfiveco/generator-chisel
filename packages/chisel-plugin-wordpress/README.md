# chisel-plugin-wordpress

Modifies chisel-scripts' webpack config with copying of assets and generation of json manifest used to link assets from WordPress templates.

## Injected Commands

- **`chisel-scripts dev`**

  Uses [Browsersync](https://www.browsersync.io/) in combination with [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) and [webpack-hot-middleware](https://github.com/webpack-contrib/webpack-hot-middleware) to provide good development experience.

  ```text
  Usage: chisel-scripts dev [options]

  start development server
  ```

- **`chisel-scripts wp`**

  ```text
  Usage: chisel-scripts wp [options]

  run WP-CLI command
  ```

- **`chisel-scripts wp-config`**

  ```text
  Usage: chisel-scripts wp-config [options]

  configure WP (writes wp/wp-config-local.php an dev-vhost.conf)
  ```

- **`chisel-scripts add-page`**

  ```text
  Usage: chisel-scripts add-page [options] <page...>

  add page(s) (creates twig templates and entries in WP)
  ```
