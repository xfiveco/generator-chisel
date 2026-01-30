<?php

namespace Chisel\Helpers;

use Timber\Timber;
use Timber\Loader;

use Chisel\Timber\Cache;

/**
 * Image Helper functions.
 *
 * @package Chisel
 */
final class CacheHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Get the cache expiry time.
	 *
	 * @param ?int $custom_expiry The custom expiry time.
	 *
	 * @return ?int
	 */
	public static function expiry( ?int $custom_expiry = null ): int {
		$cache = Cache::get_instance();

		if ( ! $cache->cache_everything ) {
			return 0;
		}

		return $custom_expiry ?? (int) $cache->cache_expiry;
	}

	/**
	 * Clear twig environment cache.
	 *
	 * @return void
	 */
	public static function clear_environment_cache(): void {
		$loader = new Loader();
		$loader->clear_cache_twig();
	}
}
