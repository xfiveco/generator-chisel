<?php

namespace Chisel\Helpers;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class YoastHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Check if Yoast plugin is active.
	 *
	 * @return bool
	 */
	public static function is_yoast_active(): bool {
		return class_exists( '\WPSEO_Options' );
	}

	/**
	 * Display breadcrumbs.
	 *
	 * @return string
	 */
	public static function breadcrumbs(): string {
		if ( ! self::is_yoast_active() ) {
			return '';
		}

		if ( is_front_page() ) {
			return '';
		}

		return (string) yoast_breadcrumb( '<div class="c-breadcrumbs o-wrapper__inner">', '</div>', false );
	}
}
