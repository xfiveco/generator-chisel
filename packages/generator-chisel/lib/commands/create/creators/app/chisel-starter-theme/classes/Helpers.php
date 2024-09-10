<?php

namespace Chisel;

/**
 * Helper functions.
 *
 * @package Chisel
 */
class Helpers {

	/**
	 * Color palettes.
	 *
	 * @var array
	 */
	protected static $colors_palettes = array(
		'acf'     => array(),
		'tinymce' => '',
	);

	/**
	 * Check if current environment is development. Set define( 'WP_ENVIRONMENT_TYPE', 'development' ); in wp-config-local.php.
	 *
	 * @return bool
	 */
	public static function is_dev_env() {
		return wp_get_environment_type() === 'development';
	}

	/**
	 * Get theme version.
	 *
	 * @return bool
	 */
	public static function get_theme_version() {
		$theme = wp_get_theme();
		return $theme->get( 'Version' );
	}

	/**
	 * Get colors palette for given type from theme.json file.
	 *
	 * @param string $type Type of palette to get.
	 *
	 * @return array
	 */
	public static function get_colors_palette( $type ) {
		if ( ! isset( self::$colors_palettes[$type] ) || self::$colors_palettes[$type] ) {
			return self::$colors_palettes[$type];
		}

		$theme_json      = get_template_directory() . '/theme.json';
		$theme_json_data = wp_json_file_decode( $theme_json, array( 'associative' => true ) );
		$colors_palette  = $theme_json_data['settings']['color']['palette'];

		if ( $colors_palette ) {
			foreach ( $colors_palette as $color_data ) {
				$color = sanitize_hex_color( $color_data['color'] );

				if ( $type === 'acf' ) {
					self::$colors_palettes[$type][] = $color;
				} elseif ( $type === 'tinymce' ) {
					self::$colors_palettes[$type] .= sprintf(
						'"%s", "%s",',
						str_replace( '#', '', $color ),
						esc_attr( $color_data['name'] )
					);
				}
			}
		}

		return apply_filters( 'chisel_' . $type . '_colors_palette', self::$colors_palettes[$type] );
	}

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
	 * Get logo url for the wp login page.
	 *
	 * @return string
	 */
	public static function get_login_page_logo_url() {
		$logo_url = '';
		$logo_id  = get_theme_mod( 'custom_logo', 0 );

		if ( $logo_id ) {
			$logo_url = wp_get_attachment_image_url( $logo_id, 'medium' );
		} else {
			$logo_url = self::get_image_url( 'chisel.png' );
		}

		return $logo_url;
	}
}
