<?php

namespace Chisel;

use Timber\Timber;
use Chisel\ChiselCache;

/**
 * Custom Ajax enpoints callbacks
 *
 * @package Chisel
 */
class AjaxEnpoints {

	/**
	 * Ajax call for load more feature.
	 *
	 * @param \WP_REST_Request $request WP_REST_Request.
	 *
	 * @return json
	 */
	public function load_more( $request ) {
		if ( ! $request ) {
			return $this->error( 'No request data' );
		}

		$data = $this->get_data( $request );

		$post_type = sanitize_text_field( $data['post_type'] );
		$per_page  = absint( $data['per_page'] );
		$page      = absint( $data['page'] );

		$response = '';

		$posts = Timber::get_posts(
			array(
				'post_type'      => $post_type,
				'posts_per_page' => $per_page,
				'paged'          => $page,
			)
		);

		$templates = array( 'components/' . $post_type . '-item.twig', 'components/post-item.twig' );

		if ( $post_type === 'product' ) {
			array_unshift( $templates, 'woocommerce/content-product.twig' );
		}

		if ( $posts ) {
			foreach ( $posts as $post ) {
				$response .= Timber::compile( $templates, array( 'post' => $post ), ChiselCache::expiry() );
			}
		}

		return $this->success( $response );
	}

	/**
	 * Get data from request.
	 *
	 * @param \WP_REST_Request $request WP_REST_Request.
	 *
	 * @return array
	 */
	protected function get_data( $request ) {
		return $request->get_body_params();
	}

	/**
	 * This function will return a success response.
	 *
	 * @param array $data
	 *
	 * @return \WP_REST_Response
	 */
	protected function success( $data = array() ) {
		return new \WP_REST_Response(
			array(
				'error'   => 0,
				'message' => 'ok',
				'data'    => $data,
			),
			200
		);
	}

	/**
	 * This function will return an error response.
	 *
	 * @param string $message
	 *
	 * @return \WP_REST_Response
	 */
	protected function error( $message ) {
		return new \WP_REST_Response(
			array(
				'error'   => 1,
				'message' => $message,
			),
			400
		);
	}
}
