<?php

namespace Chisel\Plugins\GravityForms;

use Chisel\Traits\HooksSingleton;
use Chisel\Helpers\GravityFormsHelpers;

/**
 * GravityForms related functionalities.
 *
 * @package Chisel
 */
final class GravityForms {

	use HooksSingleton;

	/**
	 * Initialize.
	 */
	public function init() {
		if ( ! GravityFormsHelpers::is_gf_active() ) {
			return false;
		}

		return true;
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'deregister_scripts' ), 999 );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'chisel_frontend_footer_styles', array( $this, 'register_custom_styles' ) );
		add_filter( 'chisel_enqueue_frontend_footer_style', array( $this, 'enqueue_custom_styles' ), 10, 2 );
		add_filter( 'gform_form_theme_slug', array( $this, 'default_form_styles' ), 99 );
		add_filter( 'gform_plugin_settings_fields', array( $this, 'plugin_settings_fields' ), 99 );
	}

	/**
	 * This function will deregister gforms specific scripts
	 */
	public function deregister_scripts(): void {
		wp_dequeue_style( 'gforms_reset_css' );
	}

	/**
	 * Register custom styles.
	 *
	 * @param array $styles
	 *
	 * @return array
	 */
	public function register_custom_styles( array $styles ): array {
		$styles['gravity-forms'] = array();

		return $styles;
	}

	/**
	 * Enqueue custom styles conditionally.
	 *
	 * @param bool   $enqueue
	 * @param string $handle
	 *
	 * @return bool
	 */
	public function enqueue_custom_styles( bool $enqueue, string $handle ): bool {
		if ( $handle !== 'gravity-forms' ) {
			return $enqueue;
		}

		global $post;

		if ( $post instanceof \WP_Post ) {
			$enqueue = has_block( 'gravityforms/form', $post );
		}

		return $enqueue;
	}

	/**
	 * Set default form styles for all forms so that our custom styles can be used.
	 *
	 * @param string $slug
	 *
	 * @return string
	 */
	public function default_form_styles( string $slug ): string {
		if ( ! is_admin() ) {
			$slug = 'gravity-theme';
		}

		return $slug;
	}

	/**
	 * Remove default theme settings so that we can use our custom styles.
	 *
	 * @param array $fields
	 *
	 * @return array
	 */
	public function plugin_settings_fields( array $fields ): array {
		unset( $fields['default_theme'] );

		return $fields;
	}
}
