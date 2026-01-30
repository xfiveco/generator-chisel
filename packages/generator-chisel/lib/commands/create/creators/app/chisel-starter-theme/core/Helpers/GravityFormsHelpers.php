<?php

namespace Chisel\Helpers;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class GravityFormsHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Check if Gravity Forms plugin is active.
	 *
	 * @return bool
	 */
	public static function is_gf_active(): bool {
		return class_exists( '\GFForms' );
	}

	/**
	 * Get list of available Gravity Forms. Can be used in acf/load_field filter to populate the select field.
	 *
	 * @return array
	 */
	public static function get_forms_list(): array {
		if ( ! class_exists( 'GFForms' ) ) {
			return array();
		}

		$forms = \GFAPI::get_forms();

		$list = array();

		if ( $forms ) {
			foreach ( $forms as $form ) {
				$list[$form['id']] = $form['title'];
			}
		}

		return $list;
	}

	/**
	 * This function will generate the gravity form for a given id with default parameters. Use if you need to generate ajax fomr outside of blocks.
	 *
	 * @param int    $form_id
	 * @param bool   $display_title
	 * @param bool   $display_description
	 * @param bool   $display_inactive
	 * @param ?array $field_values
	 * @param bool   $ajax
	 * @param int    $tabindex
	 * @param bool   $_echo
	 *
	 * @return mixed
	 */
	public static function get_form( int $form_id, bool $display_title = false, bool $display_description = false, bool $display_inactive = false, ?array $field_values = null, bool $ajax = true, int $tabindex = 0, bool $_echo = false ): mixed {
		if ( function_exists( 'gravity_form' ) ) {
			return gravity_form( $form_id, $display_title, $display_description, $display_inactive, $field_values, $ajax, $tabindex, $_echo );
		}

		return null;
	}
}
