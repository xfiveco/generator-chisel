<?php

if ( ! class_exists( 'Timber\\Timber' ) ) {
	add_action( 'admin_notices',
		function () {
			echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
		} );

	return;
}

define( 'CHISEL_NAMESPACE', 'Chisel\\' );
define( 'MANIFEST_PATH', 'dist/rev-manifest.json' );
define( 'DIST_PATH', 'dist/' );
define( 'ASSETS_PATH', 'dist/assets/' );
define( 'TEMPLATES_DIR', 'templates' );

if ( isset( $_SERVER['HTTP_X_CHISEL_PROXY'] ) ) {
	define( 'CHISEL_DEV_ENV', true );
}

spl_autoload_register( function ( $class ) {
	$baseDirectory = __DIR__ . '/Chisel/';

	$namespacePrefixLength = strlen( CHISEL_NAMESPACE );

	if ( strncmp( CHISEL_NAMESPACE, $class, $namespacePrefixLength ) !== 0 ) {
		return;
	}

	$relativeClassName = substr( $class, $namespacePrefixLength );

	$classFilename = $baseDirectory . str_replace( '\\', '/', $relativeClassName ) . '.php';

	if ( file_exists( $classFilename ) ) {
		require $classFilename;
	}
} );

new \Chisel\Site();
