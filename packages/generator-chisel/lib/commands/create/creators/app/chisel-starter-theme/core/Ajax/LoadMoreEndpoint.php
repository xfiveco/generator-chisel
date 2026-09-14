<?php

namespace Chisel\Ajax;

use Chisel\Interfaces\AjaxEndpointInterface;
use Chisel\Traits\Rest;
use Timber\Timber;
use Chisel\Helpers\CacheHelpers;

/**
 * Load more endpoint.
 *
 * @package Chisel
 */
final class LoadMoreEndpoint implements AjaxEndpointInterface {
	use Rest;

	/**
	 * Ajax call for load more posts feature.
	 *
	 * @param \WP_REST_Request $request WP_REST_Request.
	 *
	 * @return \WP_REST_Response
	 */
	public function handle( \WP_REST_Request $request ): \WP_REST_Response {
		if ( ! $request ) {
			return $this->error( 'No request data' );
		}

		$data = $this->get_data( $request );

		$post_type = isset( $data['post_type'] ) ? array_map( 'sanitize_text_field', explode( ',', $data['post_type'] ) ) : array( 'post' );
		$per_page  = isset( $data['per_page'] ) ? absint( $data['per_page'] ) : 10;
		$page      = isset( $data['page'] ) ? absint( $data['page'] ) : 1;
		$search    = isset( $data['s'] ) ? sanitize_text_field( $data['s'] ) : 'is_search';
		$is_search = isset( $data['s'] );

		/**
		 * Filters the post types the load-more endpoint is allowed to query.
		 *
		 * Requests for any post type not in this list are rejected. Add project
		 * post types here to make them loadable.
		 *
		 * @param string[] $allowed_post_types Whitelisted post type slugs.
		 * @param array    $data               The sanitized request data.
		 */
		$allowed_post_types = apply_filters( 'chisel_load_more_allowed_post_types', array( 'post', 'product' ), $data );
		$post_type          = array_values( array_intersect( $post_type, $allowed_post_types ) );

		if ( empty( $post_type ) ) {
			return $this->error( 'Invalid post type' );
		}

		/**
		 * Filters the maximum number of posts the load-more endpoint may return per request.
		 *
		 * @param int   $max_per_page Maximum posts per request.
		 * @param array $data         The sanitized request data.
		 */
		$max_per_page = (int) apply_filters( 'chisel_load_more_max_per_page', 24, $data );
		$per_page     = min( max( $per_page, 1 ), $max_per_page );

		$response = '';

		$args = array(
			'post_type'      => count( $post_type ) === 1 ? $post_type[0] : $post_type,
			'posts_per_page' => $per_page,
			'paged'          => $page,
			'no_found_rows'  => true,
		);

		if ( $search !== '' ) {
			$args['s'] = str_replace( 'is_search', '', $search );
		}

		if ( $args['post_type'] === 'product' ) {
			$args['orderby'] = get_option( 'woocommerce_default_catalog_orderby', 'menu_order' );
		}

		$args = array_merge( $args, $this->get_archive_args( $data ) );

		/**
		 * Filters the WP_Query arguments used by the load-more endpoint.
		 *
		 * Use this to scope results to the current archive (taxonomy, author, date),
		 * change ordering, or add meta/tax queries.
		 *
		 * @param array $args      The query arguments.
		 * @param array $data      The sanitized request data.
		 * @param bool  $is_search Whether this is a search request.
		 */
		$args = apply_filters( 'chisel_load_more_query_args', $args, $data, $is_search );

		$posts = Timber::get_posts( $args )->to_array();

		if ( ! empty( $posts ) ) {
			foreach ( $posts as $post ) {
				$templates = array( 'components/' . $post->post_type . '-item.twig', 'components/post-item.twig' );

				if ( $post->post_type === 'product' ) {
					array_unshift( $templates, 'woocommerce/content-product.twig' );
				}

				/**
				 * Filters the Twig template candidates for a single load-more item.
				 *
				 * The first template that exists is rendered, so prepend your own to
				 * override the card (e.g. a search-specific card when $is_search).
				 *
				 * @param string[]     $templates Ordered template candidates.
				 * @param \Timber\Post $post      The post being rendered.
				 * @param bool         $is_search Whether this is a search request.
				 */
				$templates = apply_filters( 'chisel_load_more_item_templates', $templates, $post, $is_search );

				/**
				 * Filters the context passed to a load-more item template.
				 *
				 * @param array        $context   Template context (defaults to `array( 'post' => $post )`).
				 * @param \Timber\Post $post      The post being rendered.
				 * @param bool         $is_search Whether this is a search request.
				 */
				$context = apply_filters( 'chisel_load_more_item_context', array( 'post' => $post ), $post, $is_search );

				$response .= Timber::compile( $templates, $context, CacheHelpers::expiry() );
			}
		} else {
			/**
			 * Filters the template used when the load-more query returns no posts.
			 *
			 * Empty by default: the endpoint only ever serves page 2 and up, so an empty
			 * result means the archive is exhausted, not that it was empty to begin with -
			 * appending a "no results" card into an already populated grid would be wrong.
			 *
			 * @param string $template  Template path.
			 * @param bool   $is_search Whether this is a search request.
			 */
			$no_results_template = apply_filters( 'chisel_load_more_no_results_template', '', $is_search );

			if ( $no_results_template ) {
				$response = Timber::compile( $no_results_template );
			}
		}

		/**
		 * Filters the final rendered HTML returned by the load-more endpoint.
		 *
		 * @param string $response The compiled HTML.
		 * @param array  $posts    The posts that were rendered.
		 * @param array  $data     The sanitized request data.
		 */
		$response = apply_filters( 'chisel_load_more_response', $response, $posts, $data );

		return $this->success( $response );
	}

	/**
	 * Build the query arguments that scope the request to the archive the button
	 * was rendered on. Every value is validated here - the request is public, so
	 * nothing from it reaches WP_Query unchecked.
	 *
	 * @param array $data The sanitized request data.
	 *
	 * @return array
	 */
	private function get_archive_args( array $data ): array {
		$args = array();

		if ( ! empty( $data['author'] ) ) {
			$args['author'] = absint( $data['author'] );
		}

		if ( ! empty( $data['taxonomy'] ) && ! empty( $data['term'] ) ) {
			$taxonomy = sanitize_key( $data['taxonomy'] );
			$term     = absint( $data['term'] );

			if ( taxonomy_exists( $taxonomy ) && get_term( $term, $taxonomy ) instanceof \WP_Term ) {
				// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				$args['tax_query'] = array(
					array(
						'taxonomy' => $taxonomy,
						'field'    => 'term_id',
						'terms'    => $term,
					),
				);
			}
		}

		$date_parts = array(
			'year'  => 'year',
			'month' => 'monthnum',
			'day'   => 'day',
		);

		foreach ( $date_parts as $key => $query_var ) {
			if ( ! empty( $data[ $key ] ) ) {
				$args[ $query_var ] = absint( $data[ $key ] );
			}
		}

		return $args;
	}
}
