<?php

namespace Chisel\WP\Custom;

use Chisel\Traits\HooksSingleton;

/**
 * Site related functionality related to timber.
 *
 * @package Chisel
 */
class Site {

	use HooksSingleton;

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'timber/post/classmap', array( $this, 'post_classmap' ), 11 );
	}

	/**
	 * Add custom post class map.
	 *
	 * @param array $classmap The class map.
	 *
	 * @return array
	 */
	public function post_classmap( array $classmap ): array {
		$custom_classmap = array(
			'post' => \Chisel\Timber\Custom\ChiselPost::class,
		);

		return array_merge( $classmap, $custom_classmap );
	}
}
