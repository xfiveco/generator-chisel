<?php

namespace Chisel\Helpers;

use Chisel\Helpers\ImageHelpers;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class ThemeHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}
	/**
	 * Color palettes.
	 *
	 * @var array
	 */
	private static array $colors_palettes = array(
		'acf'     => array(),
		'tinymce' => '',
	);

	/**
	 * Check if current environment is development. Set define( 'WP_ENVIRONMENT_TYPE', 'development' ); in wp-config-local.php.
	 *
	 * @return bool
	 */
	public static function is_dev_env(): bool {
		return wp_get_environment_type() === 'development';
	}

	/**
	 * Check if current environment is development and runnning in fast refresh mode. Set define( 'WP_ENVIRONMENT_TYPE', 'development' ); in wp-config-local.
	 *
	 * @return bool
	 */
	public static function is_fast_refresh(): bool {
		$runtime = get_template_directory() . '/build/runtime.js';

		return self::is_dev_env() && is_file( $runtime );
	}

	/**
	 * Get theme version.
	 *
	 * @return string
	 */
	public static function get_theme_version(): string {
		$theme = wp_get_theme();
		return (string) $theme->get( 'Version' );
	}

	/**
	 * Get theme name / site title.
	 *
	 * @return bool
	 */
	public static function get_theme_name(): string {
		return (string) get_bloginfo( 'name' );
	}

	/**
	 * Check if icons module should be used.
	 *
	 * @return bool
	 */
	public static function should_use_icons_module(): bool {
		return defined( 'CHISEL_USE_ICONS_MODULE' ) && CHISEL_USE_ICONS_MODULE;
	}

	/**
	 * Generate BEM class names with modifiers
	 *
	 * @param string $name
	 * @param mixed  ...$modifiers
	 *
	 * @return string
	 */
	public static function bem( string $name = '', mixed ...$modifiers ): string {
		if ( $name === '' || empty( $modifiers ) ) {
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
	 * Get colors palette for given type from theme.json file.
	 *
	 * @param string $type Type of palette to get.
	 *
	 * @return string|array
	 */
	public static function get_colors_palette( string $type ): string|array {
		if ( ! isset( self::$colors_palettes[$type] ) || self::$colors_palettes[$type] ) {
			return apply_filters( 'chisel_' . $type . '_colors_palette', self::$colors_palettes[$type] );
		}

		$theme_json      = get_template_directory() . '/theme.json';
		$theme_json_data = is_file( $theme_json ) ? wp_json_file_decode( $theme_json, array( 'associative' => true ) ) : array();
		$colors_palette  = isset( $theme_json_data['settings']['color']['palette'] ) ? $theme_json_data['settings']['color']['palette'] : array();

		if ( ! empty( $colors_palette ) ) {
			foreach ( $colors_palette as $color_data ) {
				$hex_color = isset( $color_data['color'] ) ? sanitize_hex_color( (string) $color_data['color'] ) : null;

				if ( ! $hex_color ) {
						continue;
				}

				if ( $type === 'acf' ) {
					self::$colors_palettes[$type][] = $hex_color;
				} elseif ( $type === 'tinymce' ) {
					self::$colors_palettes[$type] .= sprintf(
						'"%s", "%s",',
						str_replace( '#', '', $hex_color ),
						esc_attr( $color_data['name'] )
					);
				}
			}
		}

		return apply_filters( 'chisel_' . $type . '_colors_palette', self::$colors_palettes[$type] );
	}

	/**
	 * Get logo data for the wp login page.
	 *
	 * @return array
	 */
	public static function get_login_page_logo_data(): array {
		$logo_id   = (int) get_theme_mod( 'custom_logo', 0 );
		$logo_data = array();

		if ( $logo_id > 0 ) {
			$logo_data = wp_get_attachment_image_src( $logo_id, 'medium' );
		} else {
			$logo_data = array(
				ImageHelpers::get_image_url( 'chisel.svg' ),
				200,
				60,
				0,
			);
		}

		return $logo_data;
	}
}
