<?php

namespace Chisel\Helper;

/**
 * Helper functions.
 *
 * @package Chisel
 */
class YoastHelpers {

	/**
	 * Check if Gravity Forms plugin is active.
	 *
	 * @return bool
	 */
	public static function is_yoast_active() {
		return class_exists( '\WPSEO_Options' );
	}

	/**
	 * Display breadcrumbs.
	 *
	 * @return html
	 */
	public static function breadcrumbs() {
		if ( ! self::is_yoast_active() ) {
			return '';
		}

		if ( is_front_page() ) {
			return '';
		}

		return yoast_breadcrumb( '<div class="c-breadcrumbs">', '</div>', false );
	}
}
