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
	 * Responsive image data.
	 *
	 * @var array
	 */
	private static $responsive_image_data = array();

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

		self::$responsive_image_data = array(
			'image_id' => $image_id,
			'attrs'    => $attrs,
		);

		// Adjust image width and height to prevent layout shifts.
		if ( isset( $attrs['width'] ) && isset( $attrs['height'] ) ) {
			add_filter(
				'wp_get_attachment_image_src',
				array( self::class, 'responsive_image_dimensions' ),
				10,
				4
			);
		}

		$responsive_image = $image ? $image->responsive( $image_size, $attrs ) : '';

		remove_filter(
			'wp_get_attachment_image_src',
			array( self::class, 'responsive_image_dimensions' ),
			10
		);

		return $responsive_image;
	}

	/**
	 * Adjust image width and height to prevent layout shifts
	 *
	 * @param array $src
	 * @param int   $id
	 *
	 * @return array
	 */
	public static function responsive_image_dimensions( $src, $id ) {
		$image_id = self::$responsive_image_data['image_id'] ?? 0;
		$attrs    = self::$responsive_image_data['attrs'] ?? array();

		if ( $id === $image_id && isset( $attrs['width'] ) && isset( $attrs['height'] ) ) {
				$src[1] = $attrs['width'];
				$src[2] = $attrs['height'];
		}

		return $src;
	}
}
