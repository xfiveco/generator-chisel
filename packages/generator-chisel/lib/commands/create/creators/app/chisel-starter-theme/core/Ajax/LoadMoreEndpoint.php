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

		$post_type = isset( $data['post_type'] ) ? sanitize_text_field( $data['post_type'] ) : 'post';
		$per_page  = isset( $data['per_page'] ) ? absint( $data['per_page'] ) : 10;
		$page      = isset( $data['page'] ) ? absint( $data['page'] ) : 1;

		$response = '';

		$args = array(
			'post_type'      => $post_type,
			'posts_per_page' => $per_page,
			'paged'          => $page,
		);

		$posts = Timber::get_posts( $args )->to_array();

		if ( $post_type === 'product' ) {
			$args['orderby'] = get_option( 'woocommerce_default_catalog_orderby', 'menu_order' );
		}

		$templates = array( 'components/' . $post_type . '-item.twig', 'components/post-item.twig' );

		if ( $post_type === 'product' ) {
			array_unshift( $templates, 'woocommerce/content-product.twig' );
		}

		if ( ! empty( $posts ) ) {
			foreach ( $posts as $post ) {
				$response .= Timber::compile( $templates, array( 'post' => $post ), CacheHelpers::expiry() );
			}
		} else {
			$response = Timber::compile( 'components/no-results.twig' );
		}

		return $this->success( $response );
	}
}
