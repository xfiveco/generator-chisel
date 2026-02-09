# Chisel WordPress Theme

## WordPress Starter Theme based on Timber library

Chisel is a custom WordPress development framework we built to make developers’ lives easier. It streamlines theme development with a modern stack — Webpack, Timber, and ITCSS — ensuring faster coding, cleaner structure, and more maintainable projects.

## Installation

Use Node.js version `24.11.1` (Minimum `20.12.2`)

Chisel is installed as a npm package using npx command: `npx generator-chisel`, which scaffolds the entire project for you including composer and node dependencies, however when you join the project and clone the repository, follow these steps to start the local development:

1. Go to the theme folder
2. Run `composer install`
3. Run `npm install`
4. Copy `wp-config-custom.php` and rename it to `wp-config.php` in the project root directory (if you haven't done so already).
5. Run `npm run wp-config`

    After creating the `wp-config-local.php` file make sure you have these lines in the file:

    ```php
    define( 'WP_DEBUG', true );
    define( 'WP_DEBUG_LOG', true );
    define( 'WP_DEBUG_DISPLAY', false );

    // Required for the theme fast refresh mode.
    define( 'SCRIPT_DEBUG', true );
    define( 'WP_ENVIRONMENT_TYPE', 'development' );
    ```

6. Run `npm run build`

    The local URL for the new project should be `project-name.test`

7. Run `npm run dev` to start local development. The URL for local development is the same with "Fast Refresh" mode enabled for CSS and JavaScript.

## Updating Chisel

To check if a new version of Chisel is available:

```bash
npm run check-update
```

To update the core files to the latest version:

```bash
npm run update-chisel
```

Or run both at once:

```bash
npm run update
```

**Note:** The update command will overwrite all files in the `core/` folder.

## Core Folder Protection

The `core/` folder contains base Chisel files that are updated automatically when you run `npm run update-chisel`. A pre-commit hook will warn you if you try to commit changes to these files.

### Setting Up Git Hooks

Git hooks are set up automatically by the Chisel generator if git is already initialized. If you cloned the project or ran `git init` after installation, run:

```bash
npm run prepare
```

### Recommended Approach

Instead of modifying core files directly, create corresponding files in the `custom/` folder:

| Instead of modifying...          | Create/modify...                       |
|----------------------------------|----------------------------------------|
| `core/WP/Site.php`               | `custom/app/WP/Site.php`               |
| `core/Helpers/ImageHelpers.php`  | `custom/app/Helpers/ImageHelpers.php`  |
| `core/Timber/ChiselPost.php`     | `custom/app/Timber/ChiselPost.php`     |

### Bypassing the Hook

If you understand the implications and need to commit core changes anyway:

```bash
# Option 1: Skip verification
git commit --no-verify

# Option 2: Use environment variable
CHISEL_SKIP_CORE_CHECK=1 git commit
```

## Known issues

1. Browser keeps refreshing after starting the dev mode - *Open dev tools (Chrome) Network tab, select "Disable cache" checkbox and refresh the browser*.
2. Css does not refresh after modifying the styles - *Same as #1*
