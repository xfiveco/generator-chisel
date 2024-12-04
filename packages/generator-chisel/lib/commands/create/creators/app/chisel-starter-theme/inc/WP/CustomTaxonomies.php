<?php

namespace Chisel\WP;

use Chisel\Interface\InstanceInterface;
use Chisel\Interface\HooksInterface;
use Chisel\Trait\Singleton;
use Chisel\Factory\RegisterCustomTaxonomy;

/**
 * Custom post types and taxonomies wrapper class.
 *
 * @package Chisel
 */
class CustomTaxonomies implements InstanceInterface, HooksInterface {

	use Singleton;

	/**
	 * Taxonomies.
	 *
	 * @var array
	 */
	private $taxonomies = array();

	/**
	 * Default taxonomy rewrite args.
	 *
	 * @var array
	 */
	private $default_taxonomy_rewrite_args = array();

	/**
	 * Default taxonomy capabilities.
	 *
	 * @var array
	 */
	private $default_taxonomy_capabilities = array();

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
	public function set_properties() {
		$this->default_taxonomy_capabilities = apply_filters(
			'chisel_default_taxonomy_capabilities',
			array(
				'manage_terms' => 'manage_categories',
				'edit_terms'   => 'manage_categories',
				'delete_terms' => 'manage_categories',
				'assign_terms' => 'edit_posts',
			)
		);
		$this->default_taxonomy_rewrite_args = apply_filters(
			'chisel_default_taxonomy_rewrite_args',
			array(
				'slug'         => '',
				'with_front'   => true,
				'hierarchical' => true,
				'ep_mask'      => EP_NONE,
			)
		);

		$this->set_taxonomies();
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
		add_action( 'init', array( $this, 'register_taxonomies' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
	}

	/**
	 * Register custom taxonomies.
	 */
	public function register_taxonomies() {
		$this->taxonomies = apply_filters( 'chisel_custom_taxonomies', $this->taxonomies );

		if ( empty( $this->taxonomies ) ) {
			return;
		}

		$defaults = array(
			'capabilities' => $this->default_taxonomy_capabilities,
			'rewrite_args' => $this->default_taxonomy_rewrite_args,
		);

		foreach ( $this->taxonomies as $taxonomy => $taxonomy_args ) {

			$register_custom_taxonomy_factory = new RegisterCustomTaxonomy( $taxonomy, $taxonomy_args, $defaults );
			$register_custom_taxonomy_factory->register_taxonomy();
		}
	}

	/**
	 * Set custom taxonomies.
	 */
	private function set_taxonomies() {
		$this->taxonomies = array(
			// phpcs:disable
			// 'chisel-term' => array(
			// 	'singular'   => __( 'Chisel Term', 'chisel' ),
			// 	'plural'     => __( 'Chisel Terms', 'chisel' ),
			// 	'post_types' => array( 'chisel-cpt' ),
			// 	'public'     => true,
			// 	'rewrite'    => array(
			// 		'slug' => 'chisel-term',
			// 	),
			// ),
			// phpcs:enable
		);
	}
}
