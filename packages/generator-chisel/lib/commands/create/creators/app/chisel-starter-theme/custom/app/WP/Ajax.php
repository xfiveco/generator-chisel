<?php

namespace Chisel\WP\Custom;

use Chisel\Traits\HooksSingleton;

/**
 * Ajax related functionality.
 *
 * @package Chisel
 */
class Ajax {

	use HooksSingleton;

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'chisel_ajax_routes', array( $this, 'register_ajax_routes' ) );
	}

	/**
	 * Register custom ajax routes.
	 *
	 * @param array $routes The ajax routes.
	 *
	 * @return array
	 */
	public function register_ajax_routes( $routes ) {
		// phpcs:disable -- Example of custom ajax route
		// $routes['custom_route'] = array(
		// 	'methods'  => 'POST', // default is POST
		// 	'handler'  => 'Chisel\WP\Custom\Ajax\CustomRouteHandler', // custom handler class, leave empty for default handler: CustomRouteEndpoint
		// );
		// phpcs:enable

		return $routes;
	}
}
