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

	/**
	 * Get url of a theme font file. Returns an empty string if the file does not exist.
	 *
	 * @param string $font_name Font file name, e.g. `roboto-regular.woff2`.
	 *
	 * @return string
	 */
	public static function get_font_url( string $font_name ): string {
		if ( $font_name === '' ) {
			return '';
		}

		$font_path = '/assets/fonts/' . ltrim( $font_name, '/' );
		$file_path = get_template_directory() . $font_path;

		if ( ! is_file( $file_path ) ) {
			return '';
		}

		return get_template_directory_uri() . $font_path;
	}
}
