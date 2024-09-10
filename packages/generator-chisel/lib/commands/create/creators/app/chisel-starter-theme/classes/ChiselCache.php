<?php

namespace Chisel;

use Timber\Loader;

/**
 * Cache related functionalities.
 *
 * @package Chisel
 */
class ChiselCache implements Instance {

	/**
	 * Cache expiry time.
	 *
	 * @var int
	 */
	protected $cache_expiry;

	/**
	 * Class constructor.
	 */
	private function __construct() {
		$this->set_properties();
		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {
		$this->cache_expiry = apply_filters( 'chisel_cache_expiry', HOUR_IN_SECONDS );
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
		add_filter( 'timber/cache/mode', array( $this, 'cache_mode' ) );
	}

	/**
	 * Set Timber cache mode.
	 *
	 * @param string $cache_mode The cache mode.
	 *
	 * @return string
	 */
	public function cache_mode( $cache_mode ) {
		// Available cache modes: 'CACHE_NONE', 'CACHE_OBJECT' (WP Object Cache), 'CACHE_TRANSIENT', 'CACHE_SITE_TRANSIENT', 'CACHE_USE_DEFAULT'.
		$cache_mode = Loader::CACHE_USE_DEFAULT;

		return $cache_mode;
	}

	/**
	 * Get the cache expiry time.
	 *
	 * @param int $custom_expiry The custom expiry time.
	 *
	 * @return int
	 */
	public static function expiry( $custom_expiry = null ) {
		return $custom_expiry ? $custom_expiry : self::get_instance()->cache_expiry;
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
