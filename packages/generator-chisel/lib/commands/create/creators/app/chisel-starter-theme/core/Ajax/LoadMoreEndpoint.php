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

		$response = '';

		$args = array(
			'post_type'      => count( $post_type ) === 1 ? $post_type[0] : $post_type,
			'posts_per_page' => $per_page,
			'paged'          => $page,
		);

		if ( $search !== '' ) {
			$args['s'] = str_replace( 'is_search', '', $search );
		}

		if ( $args['post_type'] === 'product' ) {
			$args['orderby'] = get_option( 'woocommerce_default_catalog_orderby', 'menu_order' );
		}

		$posts = Timber::get_posts( $args )->to_array();

		if ( ! empty( $posts ) ) {
			foreach ( $posts as $post ) {
				$templates = array( 'components/' . $post->post_type . '-item.twig', 'components/post-item.twig' );

				if ( $post->post_type === 'product' ) {
					array_unshift( $templates, 'woocommerce/content-product.twig' );
				}

				$response .= Timber::compile( $templates, array( 'post' => $post ), CacheHelpers::expiry() );
			}
		} else {
			$response = Timber::compile( 'components/no-results.twig' );
		}

		return $this->success( $response );
	}
}
