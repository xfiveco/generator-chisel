<?php

namespace Chisel\Controllers;

use Chisel\WP\AjaxEndpoints;
use Chisel\Interfaces\InstanceInterface;
use Chisel\Interfaces\HooksInterface;
use Chisel\Traits\Singleton;

/**
 * Custom Ajax class based on REST API.
 *
 * @package Chisel
 */
final class AjaxController extends \WP_REST_Controller implements InstanceInterface, HooksInterface {

	use Singleton;

	/**
	 * Ajax custom route namespace.
	 *
	 * @var string
	 */
	public const ROUTE_NAMESPACE = 'chisel/v2';

	/**
	 * Ajax custom route base.
	 *
	 * @var string
	 */
	public const ROUTE_BASE = 'ajax';

	/**
	 * Ajax custom routes.
	 *
	 * @var array
	 */
	private array $routes = array();

	/**
	 * Class constructor.
	 */
	private function __construct() {
		add_action( 'after_setup_theme', array( $this, 'set_properties' ), 7 );

		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties(): void {
		$this->routes = array(
			'load-more' => array(),
		);
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'rest_api_init', array( $this, 'register_endpoints' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {}

	/**
	 * Register endpoints
	 *
	 * @return void
	 */
	public function register_endpoints(): void {
		$this->routes = apply_filters( 'chisel_ajax_routes', $this->routes );

		if ( $this->routes ) {
			foreach ( $this->routes as $route_name => $route_params ) {
				$route   = sprintf( '%s/%s/', self::ROUTE_BASE, $route_name );
				$methods = isset( $route_params['methods'] ) ? $route_params['methods'] : array( 'POST' );

				register_rest_route(
					self::ROUTE_NAMESPACE,
					$route,
					array(
						'methods'             => $methods,
						'callback'            => array( $this, 'callback' ),
						'permission_callback' => array( $this, 'permissions_check' ),
						'args'                => $this->get_endpoint_args_for_item_schema( true ),
					)
				);
			}
		}
	}

	/**
	 * Create dynamic route callback
	 *
	 * @param \WP_REST_Request $request WP_REST_Request.
	 *
	 * @return \WP_REST_Response|\WP_Error|array
	 */
	public function callback( \WP_REST_Request $request ): \WP_REST_Response|\WP_Error|array {
		$callback       = $this->get_callback_name( $request );
		$ajax_endpoints = new AjaxEndpoints();

		if ( method_exists( $ajax_endpoints, $callback ) ) {
			if ( ! defined( 'DOING_AJAX' ) ) {
				define( 'DOING_AJAX', true );
			}

			if ( ! defined( 'DOING_CHISEL_AJAX' ) ) {
				define( 'DOING_CHISEL_AJAX', true );
			}

			$callable = array( $ajax_endpoints, $callback );

			return $callable( $request );
		}

		return new \WP_Error( 'chisel_ajax_callback_missing', sprintf( 'Callback %s not found', $callback ), array( 'status' => 404 ) );
	}

	/**
	 * Check ajax request permissions.
	 *
	 * @param \WP_REST_Request $request WP_REST_Request.
	 *
	 * @return boolean
	 */
	public function permissions_check( \WP_REST_Request $request ): bool|\WP_Error {
		$verify_nonce = wp_verify_nonce( $request->get_header( 'x_wp_nonce' ), 'wp_rest' );
		$allowed      = (bool) $verify_nonce;

		$permission = apply_filters( 'chisel_ajax_permissions_check', $allowed, $this->get_callback_name( $request ), $request );

		return $permission;
	}

	/**
	 * Get callback name from ajax request.
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return string
	 */
	private function get_callback_name( \WP_REST_Request $request ): string {
		$route       = $request->get_route();
		$route_parts = explode( '/', $route );
		$callback    = str_replace( '-', '_', end( $route_parts ) );

		return $callback;
	}
}
