# chisel-plugin-static-frontend

Extends chisel-scripts with support for building static websites using Twig templates and (optionally) markdown content (processed using [marked](https://marked.js.org/)).

## Injected Commands

- **`chisel-scripts build`**

  Adds `--no-htmlhint` option.

- **`chisel-scripts dev`**

  ```text
  Usage: chisel-scripts dev [options]

  start development server
  ```

- **`chisel-scripts add-page`**

  ```text
  Usage: chisel-scripts add-page [options] <page...>

  add page(s) (creates twig templates or markdown files)

  Options:
    --no-build  do not build after adding pages
  ```
