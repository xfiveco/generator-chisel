<?php

namespace Chisel;

/**
 * Class Security
 * @package Chisel
 *
 * Default security settings for Chisel
 */
class Security {
	public function __construct() {
		remove_action( 'wp_head', 'wp_generator' );
		add_filter( 'the_generator', '__return_null' );
		add_filter( 'xmlrpc_enabled', '__return_false' );
		add_filter( 'script_loader_src', array( $this, 'removeSrcVersion' ) );
		add_filter( 'style_loader_src', array( $this, 'removeSrcVersion' ) );
	}

	public function removeSrcVersion( $src ) {
		global $wp_version;
		$version_str = '?ver=' . $wp_version;
		$offset      = strlen( $src ) - strlen( $version_str );
		if ( $offset >= 0 && strpos( $src, $version_str, $offset ) !== false ) {
			return substr( $src, 0, $offset );
		}

		return $src;
	}
}
