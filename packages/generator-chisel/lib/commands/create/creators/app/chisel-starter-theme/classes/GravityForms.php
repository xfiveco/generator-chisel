<?php

namespace Chisel;

/**
 * GravityForms related functionalities.
 *
 * @package Chisel
 */
class GravityForms implements Instance {

	/**
	 * Class constructor.
	 */
	private function __construct() {
		if ( ! self::is_gf_active() ) {
			return;
		}

		$this->set_properties();
		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
		add_action( 'wp_enqueue_scripts', array( $this, 'deregister_scripts' ), 999 );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
		add_filter( 'chisel_frontend_styles', array( $this, 'register_custom_styles' ) );
		add_filter( 'chisel_enqueue_frontend_style', array( $this, 'enqueue_custom_styles' ), 10, 3 );
		add_filter( 'gform_form_theme_slug', array( $this, 'default_form_styles' ), 99, 2 );
		add_filter( 'gform_plugin_settings_fields', array( $this, 'plugin_settings_fields' ), 99 );
	}

	/**
	 * This function will deregister gforms specific scripts
	 */
	public function deregister_scripts() {
		wp_dequeue_style( 'gforms_reset_css' );
	}

	/**
	 * Register custom styles.
	 *
	 * @param array $styles
	 *
	 * @return array
	 */
	public function register_custom_styles( $styles ) {
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
	public function enqueue_custom_styles( $enqueue, $handle, $args ) {
		if ( $handle !== 'gravity-forms' ) {
			return $enqueue;
		}

		global $post;

		if ( $post ) {
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
	public function default_form_styles( $slug, $form ) {
		$slug = 'gravity-theme';

		return $slug;
	}

	/**
	 * Remove default theme settings so that we can use our custom styles.
	 *
	 * @param array $fields
	 *
	 * @return array
	 */
	public function plugin_settings_fields( $fields ) {
		if ( isset( $fields['default_theme'] ) ) {
			unset( $fields['default_theme'] );
		}

		return $fields;
	}

	/**
	 * Check if Gravity Forms plugin is active.
	 *
	 * @return bool
	 */
	public static function is_gf_active() {
		return class_exists( '\GFForms' );
	}

	/**
	 * Get the instance of the class.
	 */
	public static function get_instance() {
		static $instance = null;

		if ( null === $instance ) {
			$instance = new self();
		}

		return $instance;
	}
}
