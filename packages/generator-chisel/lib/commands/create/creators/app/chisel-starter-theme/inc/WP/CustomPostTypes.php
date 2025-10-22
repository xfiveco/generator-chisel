<?php

namespace Chisel\WP;

use Chisel\Interfaces\InstanceInterface;
use Chisel\Interfaces\HooksInterface;
use Chisel\Traits\Singleton;
use Chisel\Factories\RegisterCustomPostType;

/**
 * Custom post types and taxonomies wrapper class.
 *
 * @package Chisel
 */
final class CustomPostTypes implements InstanceInterface, HooksInterface {

	use Singleton;

	/**
	 * Post types.
	 *
	 * @var array
	 */
	private array $post_types = array();

	/**
	 * Default post type supports.
	 *
	 * @var array
	 */
	private array $default_post_type_supports = array();

	/**
	 * Default post type rewrite args.
	 *
	 * @var array
	 */
	private array $default_post_type_rewrite_args = array();

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
		$this->default_post_type_supports     = (array) apply_filters( 'chisel_default_post_type_supports', array( 'title', 'page-attributes', 'revisions', 'author' ) );
		$this->default_post_type_rewrite_args = (array) apply_filters(
			'chisel_default_post_type_rewrite_args',
			array(
				'slug'       => '',
				'with_front' => true,
				'feeds'      => true,
				'pages'      => true,
				'ep_mask'    => EP_PERMALINK,
			)
		);

		$this->set_post_types();
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'init', array( $this, 'register_post_types' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {}

	/**
	 * Register custom post types.
	 */
	public function register_post_types(): void {
		$this->post_types = apply_filters( 'chisel_custom_post_types', $this->post_types );

		if ( empty( $this->post_types ) ) {
			return;
		}

		$defaults = array(
			'supports'     => $this->default_post_type_supports,
			'rewrite_args' => $this->default_post_type_rewrite_args,
		);

		foreach ( $this->post_types as $post_type => $post_type_args ) {
			$register_custom_post_type_factory = new RegisterCustomPostType( $post_type, $post_type_args, $defaults );
			$register_custom_post_type_factory->register_post_type();
		}
	}

	/**
	 * Set custom post types.
	 */
	private function set_post_types(): void {
		$this->post_types = array(
			// phpcs:disable
			// 'chisel-cpt' => array(
			// 	'singular'      => __( 'Chisel CPT', 'chisel' ),
			// 	'plural'        => __( 'Chisel CPTs', 'chisel' ),
			// 	'supports'      => array( 'editor', 'thumbnail', 'excerpt' ),
			// 	'menu-icon'     => 'location-alt',
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
}
