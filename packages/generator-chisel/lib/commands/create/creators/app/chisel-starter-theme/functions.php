<?php

define( 'CHISEL_NAMESPACE', 'Chisel\\' );

require_once get_template_directory() . '/vendor/autoload.php';

spl_autoload_register(
	function ( $class_name ) {
		$base_directory = get_template_directory() . '/inc/';

		$namespace_prefix_length = strlen( CHISEL_NAMESPACE );

		if ( strncmp( CHISEL_NAMESPACE, $class_name, $namespace_prefix_length ) !== 0 ) {
			return;
		}

		$relative_class_name = substr( $class_name, $namespace_prefix_length );

		$class_filename = $base_directory . str_replace( '\\', '/', $relative_class_name ) . '.php';

		if ( file_exists( $class_filename ) ) {
			require $class_filename;
		}
	}
);

Timber\Timber::init();

\Chisel\Module\Ajax::get_instance();
\Chisel\WP\Blocks::get_instance();
\Chisel\WP\Acf::get_instance();
\Chisel\WP\AcfBlocks::get_instance();
\Chisel\WP\Assets::get_instance();
\Chisel\WP\Cache::get_instance();
\Chisel\WP\Comments::get_instance();
\Chisel\WP\Site::get_instance();
\Chisel\WP\Sidebars::get_instance();
\Chisel\WP\Theme::get_instance();
\Chisel\WP\CustomPostTypes::get_instance();
\Chisel\WP\CustomTaxonomies::get_instance();
\Chisel\WP\Twig::get_instance();
\Chisel\Plugin\GravityForms::get_instance();
\Chisel\Plugin\Woocommerce::get_instance();
\Chisel\Plugin\Yoast::get_instance();
