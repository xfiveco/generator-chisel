<?php

define( 'CHISEL_NAMESPACE', 'Chisel\\' );

require_once get_template_directory() . '/vendor/autoload.php';

spl_autoload_register(
	function ( $class_name ) {
		$base_directories = array(
			get_template_directory() . '/core/',
			get_template_directory() . '/custom/app/',
		);

		$namespace_prefix_length = strlen( CHISEL_NAMESPACE );

		if ( strncmp( CHISEL_NAMESPACE, $class_name, $namespace_prefix_length ) !== 0 ) {
				return;
		}

		$relative_class_name = substr( $class_name, $namespace_prefix_length );
		$relative_path       = str_replace( '\\', '/', $relative_class_name ) . '.php';

		foreach ( $base_directories as $base_directory ) {
			if ( strpos( $base_directory, 'custom/app' ) !== false ) {
				$relative_path = preg_replace( '/\/Custom\//', '/', $relative_path, 1 );
			}

			$class_filename = $base_directory . $relative_path;

			if ( file_exists( $class_filename ) ) {
				require $class_filename;
				return;
			}
		}
	}
);

// Icons module. Also requires packacke.json and scss configuration.
if ( ! defined( 'CHISEL_USE_ICONS_MODULE' ) ) {
	define( 'CHISEL_USE_ICONS_MODULE', true );
}

Timber\Timber::init();

\Chisel\Controllers\AjaxController::get_instance();
\Chisel\WP\Blocks::get_instance();
\Chisel\WP\Acf::get_instance();
\Chisel\WP\AcfBlocks::get_instance();
\Chisel\WP\Assets::get_instance();
\Chisel\WP\Comments::get_instance();
\Chisel\WP\Site::get_instance();
\Chisel\WP\Sidebars::get_instance();
\Chisel\WP\Theme::get_instance();
\Chisel\WP\CustomPostTypes::get_instance();
\Chisel\WP\CustomTaxonomies::get_instance();
\Chisel\WP\Twig::get_instance();
\Chisel\Plugins\GravityForms\GravityForms::get_instance();
\Chisel\Plugins\Woocommerce\Woocommerce::get_instance();
\Chisel\Plugins\Yoast\Yoast::get_instance();
\Chisel\Timber\Cache::get_instance();

$custom_functions_php = get_template_directory() . '/custom/functions.php';

if ( is_file( $custom_functions_php ) ) {
	require_once $custom_functions_php;
}
