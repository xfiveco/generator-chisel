<?php

namespace Chisel\WP\Custom;

use Chisel\Traits\HooksSingleton;

/**
 * Custom Post Types related functionality.
 *
 * @package Chisel
 */
class CustomPostTypes {
	use HooksSingleton;

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'chisel_custom_post_types', array( $this, 'register_custom_post_types' ) );
		add_filter( 'chisel_custom_taxonomies', array( $this, 'register_custom_taxonomies' ) );
	}

	/**
	 * Register custom post types.
	 *
	 * @param array $post_types The post types.
	 *
	 * @return array
	 */
	public function register_custom_post_types( $post_types ) {
		// phpcs:disable -- Example of custom post type. Remove this line and the phpcs:enable when adding your own custom post types
		// $post_types['chisel-cpt'] = array(
		// 	'singular'      => __( 'Chisel CPT', 'chisel' ),
		// 	'plural'        => __( 'Chisel CPTs', 'chisel' ),
		// 	'supports'      => array( 'editor', 'thumbnail', 'excerpt' ),
		// 	'menu_icon'     => 'dashicons-location-alt',
		// 	'hierarchical'  => true,
		// 	'public'        => true,
		// 	'menu_position' => 20,
		// 	'rewrite'       => array(
		// 		'slug' => 'chisel-post',
		// 	),
		// );
		// phpcs:enable

		return $post_types;
	}

	/**
	 * Register custom taxonomies.
	 *
	 * @param array $taxonomies The taxonomies.
	 *
	 * @return array
	 */
	public function register_custom_taxonomies( $taxonomies ) {
		// phpcs:disable -- Example of custom taxonomy. Remove this line and the phpcs:enable when adding your own custom taxonomies
		// $taxonomies['chisel-term'] = array(
		// 	'singular'   => __( 'Chisel Term', 'chisel' ),
		// 	'plural'     => __( 'Chisel Terms', 'chisel' ),
		// 	'post_types' => array( 'chisel-cpt' ),
		// 	'public'     => true,
		// 	'rewrite'    => array(
		// 		'slug' => 'chisel-term',
		// 	),
		// );
		// phpcs:enable

		return $taxonomies;
	}
}
