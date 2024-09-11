<?php

define( 'CHISEL_NAMESPACE', 'Chisel\\' );

require_once get_template_directory() . '/vendor/autoload.php';

$interfaces = glob( get_template_directory() . '/classes/interfaces/*.php' );

spl_autoload_register(
	function ( $class_name ) use ( $interfaces ) {
		$base_directory = get_template_directory() . '/classes/';

		$namespace_prefix_length = strlen( CHISEL_NAMESPACE );

		if ( strncmp( CHISEL_NAMESPACE, $class_name, $namespace_prefix_length ) !== 0 ) {
			return;
		}

		// Load interfaces.
		foreach ( $interfaces as $interface ) {
			require_once $interface;
		}

		$relative_class_name = substr( $class_name, $namespace_prefix_length );

		$class_filename = $base_directory . str_replace( '\\', '/', $relative_class_name ) . '.php';

		if ( file_exists( $class_filename ) ) {
			require $class_filename;
		}
	}
);

Timber\Timber::init();

\Chisel\Blocks::get_instance();
\Chisel\Acf::get_instance();
\Chisel\AcfBlocks::get_instance();
\Chisel\Ajax::get_instance();
\Chisel\Assets::get_instance();
\Chisel\ChiselCache::get_instance();
\Chisel\Comments::get_instance();
\Chisel\GravityForms::get_instance();
\Chisel\Site::get_instance();
\Chisel\Sidebars::get_instance();
\Chisel\Theme::get_instance();
\Chisel\CustomPostTypes::get_instance();
\Chisel\Twig::get_instance();
\Chisel\Woocommerce::get_instance();
\Chisel\Yoast::get_instance();
