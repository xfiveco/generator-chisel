<?php

namespace Chisel\Helpers;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class AssetsHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Get the final handle for the asset.
	 *
	 * @param string $handle
	 *
	 * @return string
	 */
	public static function get_final_handle( string $handle ): string {
		$handle = 'chisel-' . $handle;

		if ( ThemeHelpers::is_fast_refresh() ) {
			$handle .= '-fast-refresh';
		}

		return $handle;
	}
}
