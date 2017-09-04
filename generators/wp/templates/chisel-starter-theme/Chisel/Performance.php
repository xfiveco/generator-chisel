<?php

namespace Chisel;

/**
 * Class Performance
 * @package Chisel
 *
 * Default performance settings for Chisel
 */
class Performance {

	private $scriptsToAsync = array( 'wp-embed.min.js' );
	private $scriptsToDefer = array( );

	public function __construct() {
		add_filter( 'script_loader_tag', array( $this, 'asyncScript' ) );
		add_filter( 'script_loader_tag', array( $this, 'deferScript' ) );
	}

	/**
	 * Async scripts
	 * @param  string $tag Script tag
	 * @return string      Script tag
	 */
	public function asyncScript( $tag ) {
		if ( is_admin() ) {
			return $tag;
		}

		foreach ( $this->scriptsToAsync as $script ) {
			if ( strpos( $tag, $script ) == true ) {
				return str_replace( ' src', ' async src', $tag );
			}
		}

		return $tag;
	}

	/**
	 * Defer scripts
	 * @param  string $tag Script tag
	 * @return string      Script tag
	 */
	public function deferScript( $tag ) {
		if ( is_admin() ) {
			return $tag;
		}

		foreach ( $this->scriptsToDefer as $script ) {
			if ( strpos( $tag, $script ) == true ) {
				return str_replace( ' src', ' defer src', $tag );
			}
		}

		return $tag;
	}

}
