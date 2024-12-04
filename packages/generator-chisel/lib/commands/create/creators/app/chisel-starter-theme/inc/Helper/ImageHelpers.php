<?php

namespace Chisel\Helper;

use Timber\Timber;

/**
 * Image Helper functions.
 *
 * @package Chisel
 */
class ImageHelpers {

	/**
	 * Get image url of the theme images.
	 *
	 * @param string $image_name
	 * @param bool   $is_icon
	 *
	 * @return string
	 */
	public static function get_image_url( $image_name, $is_icon = false ) {
		$folder_name = $is_icon ? 'icons' : 'images';
		$image_path  = '/assets/' . $folder_name . '/' . $image_name;
		$file_path   = get_template_directory() . $image_path;

		if ( ! file_exists( $file_path ) ) {
			return '';
		}

		return get_template_directory_uri() . $image_path;
	}

	/**
	 * Get responsive image html
	 *
	 * @param int    $image_id Image ID.
	 * @param string $image_size Image size.
	 * @param array  $attrs Image attributes.
	 *
	 * @return string|html
	 */
	public static function get_responsive_image( $image_id, $image_size = 'medium', $attrs = array() ) {
		if ( ! $image_id ) {
			return '';
		}

		$image = Timber::get_image( $image_id );

		return $image ? $image->responsive( $image_size, $attrs ) : '';
	}
}
