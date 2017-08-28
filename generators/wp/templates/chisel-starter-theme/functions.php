<?php
define( 'CHISEL_NAMESPACE', 'Chisel\\' );

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

\Chisel\Helpers::setChiselEnv();
if ( \Chisel\Helpers::isTimberActivated() ) {
	new \Chisel\Security();
	new \Chisel\Performance();
	new \Chisel\TwigExtensions();
	new \Chisel\WpExtensions();
	new \Chisel\Site();
} else {
	\Chisel\Helpers::addTimberAdminNotice();
}
