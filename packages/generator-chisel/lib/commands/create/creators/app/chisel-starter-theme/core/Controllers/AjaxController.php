<?php

namespace Chisel\Controllers;

use Chisel\Traits\HooksSingleton;
use Chisel\Traits\Rest;

/**
 * Custom Ajax class based on REST API.
 *
 * @package Chisel
 */
final class AjaxController extends \WP_REST_Controller {

	use HooksSingleton;
	use Rest;

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
				$handler = isset( $route_params['handler'] ) ? $route_params['handler'] : null;

				register_rest_route(
					self::ROUTE_NAMESPACE,
					$route,
					array(
						'methods'             => $methods,
						'callback'            => array( $this, 'callback' ),
						'permission_callback' => array( $this, 'permissions_check' ),
						'args'                => $this->get_endpoint_args_for_item_schema( true ),
						'handler'             => $handler,
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
		$endpoint_class = $this->get_endpoint_class( $request );

		if ( is_wp_error( $endpoint_class ) ) {
			return $this->error( $endpoint_class->get_error_message() );
		}

		$callback = 'handle';

		if ( method_exists( $endpoint_class, $callback ) ) {
			if ( ! defined( 'DOING_AJAX' ) ) {
				define( 'DOING_AJAX', true );
			}

			if ( ! defined( 'DOING_CHISEL_AJAX' ) ) {
				define( 'DOING_CHISEL_AJAX', true );
			}

			$endpoint = new $endpoint_class();
			return $endpoint->handle( $request );
		}

		return $this->error( sprintf( 'Callback `%s()` not found in %s class', $callback, $endpoint_class ) );
	}

	/**
	 * Check ajax request permissions.
	 *
	 * @param \WP_REST_Request $request WP_REST_Request.
	 *
	 * @return boolean|\WP_REST_Response|\WP_Error
	 */
	public function permissions_check( \WP_REST_Request $request ): bool|\WP_REST_Response|\WP_Error {
		$verify_nonce = wp_verify_nonce( $request->get_header( 'x_wp_nonce' ), 'wp_rest' );
		$allowed      = (bool) $verify_nonce;

		$endpoint_class = $this->get_endpoint_class( $request );

		if ( is_wp_error( $endpoint_class ) ) {
			return $this->error( $endpoint_class->get_error_message() );
		}

		$endpoint_class = sanitize_key( str_replace( '\\', '-', $endpoint_class ) );

		$permission = apply_filters( 'chisel_ajax_permissions_check', $allowed, $endpoint_class, $request );

		return $permission;
	}

	/**
	 * Get callback class from ajax request.
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return string|\WP_Error
	 */
	private function get_endpoint_class( \WP_REST_Request $request ): string|\WP_Error {
		$custom_class_name = $this->get_endpoint_custom_class( $request );

		if ( is_wp_error( $custom_class_name ) ) {
			return $custom_class_name;
		}

		if ( $custom_class_name ) {
			return $custom_class_name;
		}

		$route          = $request->get_route();
		$route_parts    = explode( '/', $route );
		$endpoint       = end( $route_parts );
		$endpoint_parts = explode( '-', $endpoint );
		$endpoint_parts = array_map( 'ucfirst', $endpoint_parts );
		$endpoint_class = implode( '', $endpoint_parts ) . 'Endpoint';

		$custom_class_name  = CHISEL_NAMESPACE . 'Ajax\\Custom\\' . $endpoint_class;
		$default_class_name = CHISEL_NAMESPACE . 'Ajax\\' . $endpoint_class;

		if ( class_exists( $custom_class_name ) ) {
			$class_name = $custom_class_name;
		} elseif ( class_exists( $default_class_name ) ) {
			$class_name = $default_class_name;
		} else {
			$class_name = null;
		}

		if ( ! $class_name ) {
			return new \WP_Error( 'chisel_ajax_endpoint_class_missing', sprintf( 'Ajax Endpoint class: %s not found in inc or custom/inc directory', $endpoint_class ), array( 'status' => 404 ) );
		}

		return $class_name;
	}

	/**
	 * Get custom class from ajax request.
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return string|bool|\WP_Error
	 */
	private function get_endpoint_custom_class( \WP_REST_Request $request ): string|bool|\WP_Error {
		$attributes = $request->get_attributes();

		$custom_class = $attributes['handler'] ?? null;

		if ( ! $custom_class ) {
			return false;
		}

		if ( ! class_exists( $custom_class ) ) {
			return new \WP_Error( 'chisel_ajax_handler_class_missing', sprintf( 'Ajax custom Endpoint class: %s not found in custom/inc directory', $custom_class ), array( 'status' => 404 ) );
		}

		return $custom_class;
	}

	/**
	 * Get endpoint name from ajax request.
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return string
	 */
	private function get_endpoint_name( \WP_REST_Request $request ): string {
		$route       = $request->get_route();
		$route_parts = explode( '/', $route );
		$endpoint    = str_replace( '-', '_', end( $route_parts ) );

		return $endpoint;
	}
}
