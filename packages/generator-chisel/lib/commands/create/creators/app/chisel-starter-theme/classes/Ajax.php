<?php

namespace Chisel;

use Chisel\AjaxEnpoints;

/**
 * Custom Ajax class based on REST API.
 *
 * @package Chisel
 */
class Ajax extends \WP_REST_Controller implements Instance {

	/**
	 * Ajax custom route namespace.
	 *
	 * @var string
	 */
	const ROUTE_NAMESPACE = 'chisel/v2';

	/**
	 * Ajax custom route base.
	 *
	 * @var string
	 */
	const ROUTE_BASE = 'ajax';

	/**
	 * Ajax custom routes.
	 *
	 * @var array
	 */
	protected $routes = array();

	/**
	 * Class constructor.
	 */
	private function __construct() {
		$this->set_properties();
		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {
		$this->routes = array(
			'load-more' => array(),
		);
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
		add_action( 'rest_api_init', array( $this, 'register_endpoints' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {}

	/**
	 * Register endpoints
	 *
	 * @return void
	 */
	public function register_endpoints() {
		$this->routes = apply_filters( 'chisel_ajax_routes', $this->routes );

		if ( $this->routes ) {
			foreach ( $this->routes as $route_name => $route_params ) {
				$route   = sprintf( self::ROUTE_BASE . '/%s/', $route_name );
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
	 * @return callable
	 */
	public function callback( $request ) {
		$callback       = self::get_callback_name( $request );
		$ajax_endpoints = new AjaxEnpoints();

		if ( method_exists( $ajax_endpoints, $callback ) ) {
			if ( ! defined( 'DOING_AJAX' ) ) {
				define( 'DOING_AJAX', true );
			}

			if ( ! defined( 'DOING_CHISEL_AJAX' ) ) {
				define( 'DOING_CHISEL_AJAX', true );
			}

			return call_user_func( array( $ajax_endpoints, $callback ), $request );
		}
	}

	/**
	 * Check ajax request permissions.
	 *
	 * @param \WP_REST_Request $request WP_REST_Request.
	 *
	 * @return boolean
	 */
	public function permissions_check( $request ) {
		$permission = apply_filters( 'chisel_ajax_permissions_check', true, self::get_callback_name( $request ), $request );

		return $permission;
	}

	/**
	 * Get custom ajax endpint
	 *
	 * @return string
	 */
	public static function get_ajax_endpoint_url() {
		return sprintf( '%s/wp-json/%s/%s', esc_url( get_bloginfo( 'url' ) ), self::ROUTE_NAMESPACE, self::ROUTE_BASE );
	}

	/**
	 * Decode json string from ajax request
	 *
	 * @param string $value
	 *
	 * @return array
	 */
	public static function ajax_json_decode( $value ) {
		return (array) json_decode( stripslashes( $value ) );
	}

	/**
	 * Get callback name from ajax request.
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return string
	 */
	public static function get_callback_name( $request ) {
		$route       = $request->get_route();
		$route_parts = explode( '/', $route );
		$callback    = str_replace( '-', '_', end( $route_parts ) );

		return $callback;
	}

	/**
	 * Get the instance of the class.
	 */
	public static function get_instance() {
		static $instance = null;

		if ( null === $instance ) {
			$instance = new self();
		}

		return $instance;
	}
}
