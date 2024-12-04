<?php

namespace Chisel\Helper;

use Timber\Timber;
use Timber\Loader;

use Chisel\WP\Cache;

/**
 * Image Helper functions.
 *
 * @package Chisel
 */
class CacheHelpers {

	/**
	 * Get the cache expiry time.
	 *
	 * @param int $custom_expiry The custom expiry time.
	 *
	 * @return int
	 */
	public static function expiry( $custom_expiry = null ) {
		if ( ! Cache::get_instance()->cache_everything ) {
			return 0;
		}

		return $custom_expiry ? $custom_expiry : Cache::get_instance()->cache_expiry;
	}

	/**
	 * Clear twig environment cache.
	 *
	 * @return void
	 */
	public static function clear_environment_cache() {
		$loader = new Loader();
		$loader->clear_cache_twig();
	}
}
