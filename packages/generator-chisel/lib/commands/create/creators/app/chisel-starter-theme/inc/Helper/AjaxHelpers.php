<?php

namespace Chisel\Helper;

use Chisel\Controllers\AjaxController;

/**
 * Helper functions.
 *
 * @package Chisel
 */
class AjaxHelpers {

	/**
	 * Get custom ajax endpint
	 *
	 * @return string
	 */
	public static function get_ajax_endpoint_url() {
		return sprintf( '%s/wp-json/%s/%s', esc_url( get_bloginfo( 'url' ) ), AjaxController::ROUTE_NAMESPACE, AjaxController::ROUTE_BASE );
	}

	/**
	 * Decode json string from ajax request
	 *
	 * @param string $value
	 *
	 * @return array
	 */
	public static function ajax_json_decode( $value ) {
		return (array) json_decode( stripslashes( $value ) );
	}
}
