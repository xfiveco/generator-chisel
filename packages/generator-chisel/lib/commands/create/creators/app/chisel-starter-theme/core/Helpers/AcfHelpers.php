<?php

namespace Chisel\Helpers;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class AcfHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Get the acf field value. Acf get_field() wrapper. If ACF plugin is not active, returns false.
	 *
	 * @param string $selector
	 * @param mixed  $post_id
	 * @param bool   $format_value
	 * @param bool   $escape_html
	 *
	 * @return mixed
	 */
	public static function get_field( string $selector, mixed $post_id = false, bool $format_value = true, bool $escape_html = false ) {
		if ( function_exists( 'get_field' ) ) {
			return get_field( $selector, $post_id, $format_value, $escape_html );
		}

		return null;
	}

	/**
	 * Update the acf field value. Acf update_field() wrapper. If ACF plugin is not active, returns false.
	 *
	 * @param string $selector
	 * @param mixed  $value
	 * @param mixed  $post_id
	 *
	 * @return int|bool
	 */
	public static function update_field( string $selector, mixed $value, mixed $post_id = false ) {
		if ( function_exists( 'update_field' ) ) {
			return update_field( $selector, $value, $post_id );
		}

		return false;
	}
}
