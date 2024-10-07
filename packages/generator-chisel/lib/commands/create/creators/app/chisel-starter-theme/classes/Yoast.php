<?php

namespace Chisel;

/**
 * Yoast SEO plugin related functionalities.
 *
 * @package Chisel
 */
class Yoast implements Instance {

	/**
	 * Class constructor.
	 */
	private function __construct() {
		if ( ! self::is_yoast_active() ) {
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
	public function action_hooks() {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {}

	/**
	 * Display breadcrumbs.
	 *
	 * @return html
	 */
	public static function breadcrumbs() {
		if ( ! self::is_yoast_active() ) {
			return '';
		}

		if ( is_front_page() ) {
			return '';
		}

		return yoast_breadcrumb( '<div class="c-breadcrumbs">', '</div>', false );
	}

	/**
	 * Check if Gravity Forms plugin is active.
	 *
	 * @return bool
	 */
	public static function is_yoast_active() {
		return class_exists( '\WPSEO_Options' );
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
