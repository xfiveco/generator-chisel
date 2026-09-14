<?php

namespace Chisel\Helpers;

/**
 * Helper functions for the load more feature.
 *
 * @package Chisel
 */
final class LoadMoreHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Build the `load_more` template context for the current query.
	 *
	 * Every controller that renders the load more button must use this. Without it
	 * the button has no post type or per page value and the endpoint answers with an
	 * unscoped query - the archive filter (term, author, date) is lost.
	 *
	 * @return array
	 */
	public static function get_context(): array {
		$context = array(
			'per_page'  => absint( get_option( 'posts_per_page' ) ),
			'post_type' => 'post',
			'query'     => array(),
		);

		if ( is_search() ) {
			$context['post_type'] = SearchHelpers::get_searchable_post_types();
			$context['search']    = get_search_query() ?: 'is_search';
		} elseif ( is_post_type_archive() ) {
			$post_type = get_query_var( 'post_type' );

			$context['post_type'] = $post_type ?: 'post';
		} elseif ( is_author() ) {
			$context['query']['author'] = absint( get_queried_object_id() );
		} elseif ( is_category() || is_tag() || is_tax() ) {
			$term = get_queried_object();

			if ( $term instanceof \WP_Term ) {
				$taxonomy = get_taxonomy( $term->taxonomy );

				$context['post_type']         = $taxonomy && ! empty( $taxonomy->object_type ) ? $taxonomy->object_type : 'post';
				$context['query']['taxonomy'] = $term->taxonomy;
				$context['query']['term']     = $term->term_id;
			}
		} elseif ( is_date() ) {
			$context['query'] = array_filter(
				array(
					'year'  => absint( get_query_var( 'year' ) ),
					'month' => absint( get_query_var( 'monthnum' ) ),
					'day'   => absint( get_query_var( 'day' ) ),
				)
			);
		}

		/**
		 * Filters the `load_more` context passed to the pagination component.
		 *
		 * `query` holds the archive scope forwarded to the endpoint (author, taxonomy
		 * and term, or date parts); the endpoint validates every key before using it.
		 *
		 * @param array $context The load more context.
		 */
		return apply_filters( 'chisel_load_more_context', $context );
	}
}
