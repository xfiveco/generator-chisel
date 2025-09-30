<?php

namespace Chisel\WP;

use Timber\Loader;

use Chisel\Interfaces\InstanceInterface;
use Chisel\Interfaces\HooksInterface;
use Chisel\Traits\Singleton;
use Chisel\Helper\ThemeHelpers;

/**
 * Cache related functionalities.
 *
 * @package Chisel
 */
class Cache implements InstanceInterface, HooksInterface {

	use Singleton;

	/**
	 * Cache expiry time.
	 *
	 * @var int
	 */
	public $cache_expiry = HOUR_IN_SECONDS;

	/**
	 * Cache everything mode. The whole template you render and its data will be cached.
	 *
	 * @var int
	 */
	public $cache_everything = false;

	/**
	 * Environment cache.
	 *
	 * @var int
	 */
	private $environment_cache = false;

	/**
	 * Class constructor.
	 */
	private function __construct() {
		add_action( 'after_setup_theme', array( $this, 'set_properties' ), 7 );

		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {
		$this->cache_expiry      = apply_filters( 'chisel_cache_expiry', $this->cache_expiry );
		$this->cache_everything  = apply_filters( 'chisel_cache_everything', $this->cache_everything );
		$this->environment_cache = apply_filters( 'chisel_environment_cache', $this->environment_cache );
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
		add_filter( 'timber/twig/environment/options', array( $this, 'environment_cache' ) );
	}

	/**
	 * Set Timber cache mode for cache everything mode.
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
	 * Set Timber environment cache. Uses twig cache. Caches the twig file, but not the data. In order for the cache to work WP_DEBUG must be set to false.
	 *
	 * @param array $options
	 *
	 * @return array
	 */
	public function environment_cache( $options ) {
		$options['cache']       = $this->environment_cache;
		$options['auto_reload'] = ThemeHelpers::is_dev_env();
		$options['debug']       = ThemeHelpers::is_dev_env();

		return $options;
	}
}
