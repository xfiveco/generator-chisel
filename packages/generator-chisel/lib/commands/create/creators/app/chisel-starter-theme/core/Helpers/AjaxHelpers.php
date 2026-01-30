<?php

namespace Chisel\Helpers;

use Chisel\Controllers\AjaxController;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class AjaxHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Get custom ajax endpint
	 *
	 * @return string
	 */
	public static function get_ajax_endpoint_url(): string {
		return sprintf( '%s/wp-json/%s/%s', rtrim( get_bloginfo( 'url' ), '/' ), AjaxController::ROUTE_NAMESPACE, AjaxController::ROUTE_BASE );
	}

	/**
	 * Decode json string from ajax request safely
	 *
	 * @param string $value
	 *
	 * @return array
	 */
	public static function ajax_json_decode( string $value ): array {
		$raw     = stripslashes( $value );
		$decoded = json_decode( $raw, true, 512, JSON_THROW_ON_ERROR );

		return is_array( $decoded ) ? $decoded : array();
	}
}
