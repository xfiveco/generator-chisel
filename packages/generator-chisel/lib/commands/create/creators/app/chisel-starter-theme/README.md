# Chisel Wordpress Theme

## Wordpress Starter Theme based on Timber library

Chisel is a Wordpress Starter Theme powered by Timber library that helps to seprate the logic from view by using Twig engine to render html content. It also simplifies the code, makes it more readable and speeds up development.

## Installation

Use node version `20.12.2`

Chisel is installed as a npm package using npx command: `npx generator-chisel@next`, which installs the whole projet for you including composer and node dependencies, however when you join the project and clone the repository, follow these steps to start the local developent:

1. Go to the theme folder
2. Run `composer install`
3. Run `npm install`
4. Run `npm run wp-config`

    After creating the wp-config-local.php file make sure you have these lines in the file:

    ```php
    define( 'WP_DEBUG', true );
    define( 'WP_DEBUG_LOG', true );
    define( 'WP_DEBUG_DISPLAY', false );

    // Required for the theme fast refresh mode.
    define( 'SCRIPT_DEBUG', true );
    define( 'WP_ENVIRONMENT_TYPE', 'development' );
    ```

5. Run `npm run build`

    The local url for the new project should be `project-name.test`

6. Run `npm run dev` to start local development. The url for local development is the same with "fast refresh" mode enabled for CSS and JavaScript.

## Known issues

1. Browser keeps refreshing after starting the dev mode - *Open dev tools (Chrome) Network tab, select "Disable cache" checkbox and refresh the browser*.
2. Css does not refresh after modifying the styles - *Same as #1*
