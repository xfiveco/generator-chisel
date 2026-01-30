<?php

namespace Chisel\Traits;

trait Rest {
	/**
	 * Get data from request.
	 *
	 * @param \WP_REST_Request $request WP_REST_Request.
	 *
	 * @return array
	 */
	private function get_data( \WP_REST_Request $request ): array {
		return $request->get_body_params();
	}

	/**
	 * This function will return a success response.
	 *
	 * @param mixed $data
	 *
	 * @return \WP_REST_Response
	 */
	private function success( mixed $data = array() ): \WP_REST_Response {
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
	private function error( string $message ): \WP_REST_Response {
		return new \WP_REST_Response(
			array(
				'error'   => 1,
				'message' => $message,
			),
			200
		);
	}
}
