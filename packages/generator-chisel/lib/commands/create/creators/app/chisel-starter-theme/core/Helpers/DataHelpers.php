<?php

namespace Chisel\Helpers;

use Timber\Timber;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class DataHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Json decode data for storing in html attribute
	 *
	 * @param array $data
	 *
	 * @return string
	 */
	public static function json_encode_for_data_attribute( array $data ): string {
		return htmlspecialchars( wp_json_encode( $data ) );
	}

	/**
	 * Convert an object to an array.
	 *
	 * @param object $object_to_convert
	 *
	 * @return array
	 */
	public static function object_to_array( object $object_to_convert ): array {
		return json_decode( wp_json_encode( $object_to_convert ), true );
	}
}
