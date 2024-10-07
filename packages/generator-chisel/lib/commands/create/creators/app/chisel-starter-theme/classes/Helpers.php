<?php

namespace Chisel;

use Timber\Timber;

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

		return Timber::get_image( $image_id )->responsive( $image_size, $attrs );
	}

	/**
	 * Generate BEM class names with modifiers
	 *
	 * @param string $name
	 * @param mixed  ...$modifiers
	 *
	 * @return string
	 */
	public static function bem( $name = '', ...$modifiers ) {
		if ( empty( $name ) || empty( $modifiers ) ) {
			return '';
		}

		$classnames = array( $name );

		foreach ( $modifiers as $key => $value ) {
			if ( is_array( $value ) ) {
				$values = array_map(
					function ( $val ) use ( $name, $value ) {
						return $name . '--' . _wp_to_kebab_case( $val . '-' . $value[ $val ] );
					},
					array_keys( $value )
				);

				$classnames = array_merge( $classnames, $values );
				continue;
			}

			if ( $value === false || $value === null || $value === '' ) {
				continue;
			}

			if ( is_string( $key ) ) {
				$classname = $name . '--' . _wp_to_kebab_case( $key );

				if ( ! is_bool( $value ) ) {
					$classname .= '-' . _wp_to_kebab_case( $value );
				}
			} else {
				$classname = $name . '--' . _wp_to_kebab_case( $value );
			}

			$classnames[] = $classname;
		}

		return implode( ' ', $classnames );
	}

	/**
	 * Get logo data for the wp login page.
	 *
	 * @return array
	 */
	public static function get_login_page_logo_data() {
		$logo_id   = get_theme_mod( 'custom_logo', 0 );
		$logo_data = array();

		if ( $logo_id ) {
			$logo_data = wp_get_attachment_image_src( $logo_id, 'medium' );
		} else {
			$logo_data = array(
				self::get_image_url( 'chisel.png' ),
				84,
				84,
				0,
			);
		}

		return $logo_data;
	}
}
