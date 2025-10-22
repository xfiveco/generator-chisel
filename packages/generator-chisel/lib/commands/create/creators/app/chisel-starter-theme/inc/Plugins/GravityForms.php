<?php

namespace Chisel\Plugins;

use Chisel\Interfaces\InstanceInterface;
use Chisel\Interfaces\HooksInterface;
use Chisel\Traits\Singleton;
use Chisel\Helpers\GravityFormsHelpers;

/**
 * GravityForms related functionalities.
 *
 * @package Chisel
 */
final class GravityForms implements InstanceInterface, HooksInterface {

	use Singleton;

	/**
	 * Class constructor.
	 */
	private function __construct() {
		if ( ! GravityFormsHelpers::is_gf_active() ) {
			return;
		}

		add_action( 'after_setup_theme', array( $this, 'set_properties' ), 7 );

		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties(): void {}

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
		add_filter( 'chisel_enqueue_frontend_footer_style', array( $this, 'enqueue_custom_styles' ), 10, 3 );
		add_filter( 'gform_form_theme_slug', array( $this, 'default_form_styles' ), 99, 2 );
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
	 * @param array  $args
	 *
	 * @return bool
	 */
	public function enqueue_custom_styles( bool $enqueue, string $handle, array $args ): bool {
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
	 * @param array  $form
	 *
	 * @return string
	 */
	public function default_form_styles( string $slug, array $form ): string {
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
