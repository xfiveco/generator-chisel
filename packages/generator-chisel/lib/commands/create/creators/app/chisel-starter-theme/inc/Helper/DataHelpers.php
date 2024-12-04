<?php

namespace Chisel\Helper;

use Timber\Timber;

/**
 * Helper functions.
 *
 * @package Chisel
 */
class DataHelpers {

	/**
	 * Json decode data for storing in html attribute
	 *
	 * @param array $data
	 *
	 * @return string
	 */
	public static function json_encode_for_data_attribute( $data ) {
		return htmlspecialchars( wp_json_encode( $data ) );
	}

	/**
	 * Convert an object to an array.
	 *
	 * @param object $object_to_convert
	 *
	 * @return array
	 */
	public static function object_to_array( $object_to_convert ) {
			return json_decode( wp_json_encode( $object_to_convert ), true );
	}
}
