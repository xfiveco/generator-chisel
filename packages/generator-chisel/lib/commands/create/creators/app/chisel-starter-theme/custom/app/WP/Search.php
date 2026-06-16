<?php

namespace Chisel\WP\Custom;

use Chisel\Traits\HooksSingleton;

/**
 * Search related functionality.
 *
 * @package Chisel
 */
class Search {

	use HooksSingleton;

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'chisel_searchable_post_types', array( $this, 'searchable_post_types' ) );
	}

	/**
	 * Add post types to search queries.
	 *
	 * @param array $post_types The searchable post types.
	 *
	 * @return array
	 */
	public function searchable_post_types( array $post_types ): array {
		// phpcs:disable -- remove when using the hook.
		// $post_types[] = 'product';
		// phpcs:enable

		return $post_types;
	}
}
