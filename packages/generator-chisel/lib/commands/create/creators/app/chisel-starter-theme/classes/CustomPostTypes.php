<?php

namespace Chisel;

/**
 * Custom post types and taxonomies wrapper class.
 *
 * @package Chisel
 */
class CustomPostTypes implements Instance {

	/**
	 * Post types.
	 *
	 * @var array
	 */
	protected $post_types = array();

	/**
	 * Taxonomies.
	 *
	 * @var array
	 */
	protected $taxonomies = array();

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
		$this->set_post_types();
		$this->set_taxonomies();
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
		add_action( 'init', array( $this, 'register_post_types' ) );
		add_action( 'init', array( $this, 'register_taxonomies' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
	}

	/**
	 * Register custom post types.
	 */
	public function register_post_types() {
		$this->post_types = apply_filters( 'chisel_custom_post_types', $this->post_types );

		if ( empty( $this->post_types ) ) {
			return;
		}

		foreach ( $this->post_types as $post_type => $post_type_args ) {
			new RegisterCustomObject( $post_type, $post_type_args );
		}
	}

	/**
	 * Register custom taxonomies.
	 */
	public function register_taxonomies() {
		$this->taxonomies = apply_filters( 'chisel_custom_taxonomies', $this->taxonomies );

		if ( empty( $this->taxonomies ) ) {
			return;
		}

		foreach ( $this->taxonomies as $taxonomy => $taxonomy_args ) {
			new RegisterCustomObject( $taxonomy, $taxonomy_args, 'taxonomy' );
		}
	}

	/**
	 * Set custom post types.
	 */
	protected function set_post_types() {
		$this->post_types = array(
			// phpcs:disable
			// 'chisel-cpt' => array(
			// 	'singular'      => __( 'Chisel CPT', 'chisel' ),
			// 	'plural'        => __( 'Chisel CPTs', 'chisel' ),
			// 	'supports'      => array( 'editor', 'thumbnail', 'excerpt' ),
			// 	'menu_icon'     => 'location-alt',
			// 	'hierarchical'  => true,
			// 	'public'        => true,
			// 	'menu_position' => 20,
			// 	'rewrite'       => array(
			// 		'slug' => 'chisel-post',
			// 	),
			// ),
			// phpcs:enable
		);
	}

	/**
	 * Set custom taxonomies.
	 */
	protected function set_taxonomies() {
		$this->taxonomies = array(
			// phpcs:disable
			// 'chisel-tax' => array(
			// 	'singular'   => __( 'Chisel Tax', 'chisel' ),
			// 	'plural'     => __( 'Chisel Taxes', 'chisel' ),
			// 	'post_types' => array( 'chisel-cpt' ),
			// 	'public'     => true,
			// 	'rewrite'    => array(
			// 		'slug' => 'chisel-category',
			// 	),
			// ),
			// phpcs:enable
		);
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
