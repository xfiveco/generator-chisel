<?php

namespace Chisel\WP;

use Chisel\Traits\HooksSingleton;
use Chisel\Helpers\SearchHelpers;

/**
 * Search related functionalities.
 *
 * @package Chisel
 */
final class Search {

	use HooksSingleton;

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'pre_get_posts', array( $this, 'set_search_post_types' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {}

	/**
	 * Set searchable post types on the main search query.
	 *
	 * @param \WP_Query $query The query.
	 */
	public function set_search_post_types( \WP_Query $query ): void {
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() ) {
			return;
		}

		$query->set( 'post_type', SearchHelpers::get_searchable_post_types() );
	}
}
