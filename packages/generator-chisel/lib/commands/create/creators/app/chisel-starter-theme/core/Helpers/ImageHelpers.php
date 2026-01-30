<?php

namespace Chisel\Helpers;

use Timber\Timber;

/**
 * Image Helper functions.
 *
 * @package Chisel
 */
final class ImageHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Responsive image data.
	 *
	 * @var array
	 */
	private static $responsive_image_data = array(
		'image_id' => 0,
		'attrs'    => array(),
	);

	/**
	 * Get image url of the theme images.
	 *
	 * @param string $image_name
	 * @param bool   $is_icon
	 *
	 * @return string
	 */
	public static function get_image_url( string $image_name, bool $is_icon = false ): string {
		if ( $image_name === '' ) {
			return '';
		}

		$folder_name = $is_icon ? 'icons' : 'images';
		$image_path  = '/assets/' . $folder_name . '/' . $image_name;
		$file_path   = get_template_directory() . $image_path;

		if ( ! is_file( $file_path ) ) {
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
	public static function get_responsive_image( int $image_id, string $image_size = 'medium', array $attrs = array() ): string {
		if ( $image_id <= 0 ) {
			return '';
		}

		self::$responsive_image_data = array(
			'image_id' => $image_id,
			'attrs'    => $attrs,
		);

		// Adjust image width and height to preven content layout shifts (CLS).
		if ( isset( $attrs['width'] ) && isset( $attrs['height'] ) ) {
			add_filter(
				'wp_get_attachment_image_src',
				array( self::class, 'responsive_image_dimensions' ),
				10,
				4
			);
		}

		$image = Timber::get_image( $image_id );
		$html  = $image ? (string) $image->responsive( $image_size, $attrs ) : '';

		remove_filter(
			'wp_get_attachment_image_src',
			array( self::class, 'responsive_image_dimensions' ),
			10
		);

		return $html;
	}

	/**
	 * Adjust image width and height to prevent layout shifts
	 *
	 * @param array $src
	 * @param int   $id
	 *
	 * @return array
	 */
	public static function responsive_image_dimensions( array $src, int $id ) {
		if ( empty( $src ) ) {
			return $src;
		}

		$image_id = self::$responsive_image_data['image_id'] ?? 0;
		$attrs    = self::$responsive_image_data['attrs'] ?? array();

		if ( $id === $image_id && isset( $attrs['width'] ) && isset( $attrs['height'] ) ) {
			$width  = (int) $attrs['width'];
			$height = (int) $attrs['height'];

			if ( $width > 0 && $height > 0 ) {
				$src[1] = $width;
				$src[2] = $height;
			}
		}

		return $src;
	}
}
