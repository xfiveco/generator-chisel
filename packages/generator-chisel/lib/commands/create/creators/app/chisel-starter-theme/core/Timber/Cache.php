<?php

namespace Chisel\Timber;

use Timber\Loader;

use Chisel\Traits\HooksSingleton;
use Chisel\Helpers\ThemeHelpers;

/**
 * Cache related functionalities.
 *
 * @package Chisel
 */
final class Cache {

	use HooksSingleton;

	/**
	 * Cache expiry time.
	 *
	 * @var int
	 */
	public int $cache_expiry = HOUR_IN_SECONDS;

	/**
	 * Cache everything mode. The whole template you render and its data will be cached.
	 *
	 * @var bool
	 */
	public bool $cache_everything = false;

	/**
	 * Environment cache: Twig keeps compiled templates on disk instead of compiling them on every request.
	 *
	 * @var bool
	 */
	private bool $environment_cache = true;

	/**
	 * Folder for the compiled templates.
	 *
	 * @var string
	 */
	private string $environment_cache_dir = '';

	/**
	 * The cache folder once checked: the folder, or '' when the cache is off or the folder can't be written.
	 *
	 * @var ?string
	 */
	private ?string $environment_cache_location = null;

	/**
	 * Set properties.
	 */
	public function set_properties(): void {
		$this->cache_expiry          = apply_filters( 'chisel_cache_expiry', $this->cache_expiry );
		$this->cache_everything      = apply_filters( 'chisel_cache_everything', $this->cache_everything );
		$this->environment_cache     = apply_filters( 'chisel_environment_cache', $this->environment_cache );
		$this->environment_cache_dir = (string) apply_filters( 'chisel_environment_cache_dir', WP_CONTENT_DIR . '/cache/twig' );
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
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
	public function cache_mode( string $cache_mode ): string {
		// Available cache modes: 'CACHE_NONE', 'CACHE_OBJECT' (WP Object Cache), 'CACHE_TRANSIENT', 'CACHE_SITE_TRANSIENT', 'CACHE_USE_DEFAULT'.

		/**
		 * Filters the Timber fragment cache mode.
		 *
		 * Defaults to Loader::CACHE_NONE (caching off). Return another Loader::CACHE_*
		 * constant to enable fragment caching, e.g. Loader::CACHE_TRANSIENT.
		 *
		 * @param string $cache_mode The cache mode.
		 */
		return apply_filters( 'chisel_cache_mode', Loader::CACHE_NONE );
	}

	/**
	 * Set Timber environment cache. Uses twig cache. Caches the compiled twig file, but not the data.
	 *
	 * The compiled templates go to `chisel_environment_cache_dir` (default wp-content/cache/twig), outside
	 * vendor/ so a deploy doesn't wipe it and the host can write to it. Twig checks each template file for
	 * changes on every environment, so an edited or deployed template shows on the next request without
	 * clearing the cache. When the folder can't be written, the cache stays off.
	 *
	 * @param array $options
	 *
	 * @return array
	 */
	public function environment_cache( array $options ): array {
		$options['cache']       = $this->get_environment_cache_location() ?: false;
		$options['auto_reload'] = true;
		$options['debug']       = ThemeHelpers::is_dev_env();

		return $options;
	}

	/**
	 * The folder for compiled templates, created when missing; '' when the cache is off or the folder
	 * can't be written. Checked once per request: Timber builds a Twig environment for every render.
	 *
	 * @return string
	 */
	private function get_environment_cache_location(): string {
		if ( null !== $this->environment_cache_location ) {
			return $this->environment_cache_location;
		}

		$this->environment_cache_location = '';
		$folder                           = $this->environment_cache_dir;

		if ( $this->environment_cache && $folder && ( is_dir( $folder ) || wp_mkdir_p( $folder ) ) && is_writable( $folder ) ) { // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_is_writable -- checked once per request; wp_is_writable() writes a test file on Windows.
			$this->environment_cache_location = $folder;
		}

		return $this->environment_cache_location;
	}
}
