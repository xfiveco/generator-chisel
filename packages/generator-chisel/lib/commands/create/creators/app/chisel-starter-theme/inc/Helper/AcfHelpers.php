<?php

namespace Chisel\Helper;

/**
 * Helper functions.
 *
 * @package Chisel
 */
class AcfHelpers {

	/**
	 * Get the acf field value. Acf get_field() wrapper. If ACF plugin is not active, returns false.
	 *
	 * @param string   $selector
	 * @param int|bool $post_id
	 * @param bool     $format_value
	 * @param bool     $escape_html
	 *
	 * @return mixed
	 */
	public static function get_field( $selector, $post_id = false, $format_value = true, $escape_html = false ) {
		if ( function_exists( 'get_field' ) ) {
			return get_field( $selector, $post_id, $format_value, $escape_html );
		}

		return false;
	}

	/**
	 * Update the acf field value. Acf update_field() wrapper. If ACF plugin is not active, returns false.
	 *
	 * @param string   $selector
	 * @param mixed    $value
	 * @param int|bool $post_id
	 *
	 * @return int|bool
	 */
	public static function update_field( $selector, $value, $post_id = false ) {
		if ( function_exists( 'update_field' ) ) {
			return update_field( $selector, $value, $post_id );
		}

		return false;
	}
}
