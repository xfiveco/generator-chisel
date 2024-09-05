<?php
/**
 * The base configuration for WordPress local installation
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Database table prefix
 * * External settings when needed
 *
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', '<%= databaseName %>' );

/** MySQL database username */
define( 'DB_USER', '<%= databaseUser %>' );

/** MySQL database password */
define( 'DB_PASSWORD', '<%= databasePassword %>' );

/** MySQL hostname */
define( 'DB_HOST', '<%= databaseHostPort %>' );


/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = '<%= tablePrefix %>';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', true );
define( 'SCRIPT_DEBUG', true );

// Required for the theme fast refresh mode.
define( 'WP_ENVIRONMENT_TYPE', 'development' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );
