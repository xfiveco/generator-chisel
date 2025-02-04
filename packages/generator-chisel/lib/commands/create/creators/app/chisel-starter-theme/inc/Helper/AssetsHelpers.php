<?php

namespace Chisel\Helper;

/**
 * Helper functions.
 *
 * @package Chisel
 */
class AssetsHelpers {

	/**
	 * Get the final handle for the asset.
	 *
	 * @param string $handle
	 *
	 * @return string
	 */
	public static function get_final_handle( $handle ) {
		$handle = 'chisel-' . $handle;

		if ( ThemeHelpers::is_fast_refresh() ) {
			$handle .= '-fast-refresh';
		}

		return $handle;
	}
}
