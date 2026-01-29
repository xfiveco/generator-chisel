<?php

namespace Chisel\Interfaces;

interface AjaxEndpointInterface {

	/**
	 * Handle ajax request.
	 *
	 * @param \WP_REST_Request $request WP_REST_Request.
	 *
	 * @return \WP_REST_Response
	 */
	public function handle( \WP_REST_Request $request ): \WP_REST_Response;
}
