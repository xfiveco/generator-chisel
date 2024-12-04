<?php

namespace Chisel\Factory;

/**
 * Custom axonomies wrapper class.
 *
 * @package Chisel
 */
class RegisterCustomTaxonomy {

	/**
	 * Taxonomy.
	 *
	 * @var array
	 */
	private $taxonomy;

	/**
	 * Arguments.
	 *
	 * @var array
	 */
	private $args;

	/**
	 * Default arguments.
	 *
	 * @var array
	 */
	private $defaults;

	/**
	 * Class constructor.
	 *
	 * @param string $taxonomy Taxonomy.
	 * @param array  $args Arguments.
	 * @param array  $defaults Default arguments.
	 */
	public function __construct( $taxonomy, $args, $defaults = array() ) {
		$this->taxonomy = $taxonomy;
		$this->args     = $args;
		$this->defaults = $defaults;
	}

	/**
	 * Register custom taxonomy.
	 */
	public function register_taxonomy() {
		$taxonomy      = $this->taxonomy;
		$taxonomy_args = $this->args;
		$defaults      = $this->defaults;

		$default_capabilities = isset( $defaults['capabilities'] ) ? apply_filters( 'chisel_default_taxonomy_capabilities_' . $taxonomy, $defaults['capabilities'] ) : array();
		$default_rewrite      = isset( $defaults['rewrite_args'] ) ? apply_filters( 'chisel_default_taxonomy_rewrite_args_' . $taxonomy, $defaults['rewrite_args'] ) : array();

		$labels = $this->get_taxonomy_labels();

		$default_rewrite['slug'] = $taxonomy;

		$description        = isset( $taxonomy_args['description'] ) ? $taxonomy_args['description'] : '';
		$public             = isset( $taxonomy_args['public'] ) ? $taxonomy_args['public'] : true;
		$publicly_queryable = isset( $taxonomy_args['publicly_queryable'] ) ? $taxonomy_args['publicly_queryable'] : $public;
		$hierarchical       = isset( $taxonomy_args['hierarchical'] ) ? $taxonomy_args['hierarchical'] : false; // true for a taxonomy like categories.
		$show_ui            = isset( $taxonomy_args['show_ui'] ) ? $taxonomy_args['show_ui'] : $public; // show in admin.
		$show_in_menu       = isset( $taxonomy_args['show_in_menu'] ) ? $taxonomy_args['show_in_menu'] : $show_ui; // Show in admin menu (as a submenu of post type).
		$show_in_nav_menus  = isset( $taxonomy_args['show_in_nav_menus'] ) ? $taxonomy_args['show_in_nav_menus'] : $public;
		$show_in_rest       = isset( $taxonomy_args['show_in_rest'] ) ? $taxonomy_args['show_in_rest'] : true; // set to false to hide in block editor.
		$show_tagcloud      = isset( $taxonomy_args['show_tagcloud'] ) ? $taxonomy_args['show_tagcloud'] : $show_ui;
		$show_in_quick_edit = isset( $taxonomy_args['show_in_quick_edit'] ) ? $taxonomy_args['show_in_quick_edit'] : $show_ui;
		$show_admin_column  = isset( $taxonomy_args['show_admin_column'] ) ? $taxonomy_args['show_admin_column'] : $public;
		$capabilities       = isset( $taxonomy_args['capabilities'] ) ? wp_parse_args( $taxonomy_args['capabilities'], $default_capabilities ) : $default_capabilities;
		$rewrite            = isset( $taxonomy_args['rewrite'] ) ? wp_parse_args( $taxonomy_args['rewrite'], $default_rewrite ) : $default_rewrite;
		$query_var          = isset( $taxonomy_args['query_var'] ) ? $taxonomy_args['query_var'] : $taxonomy;
		$rest_base          = isset( $taxonomy_args['rest_base'] ) ? $taxonomy_args['rest_base'] : $taxonomy;

		$args = array(
			'labels'             => $labels,
			'description'        => $description,
			'public'             => $public,
			'publicly_queryable' => $publicly_queryable,
			'hierarchical'       => $hierarchical,
			'show_ui'            => $show_ui,
			'show_in_menu'       => $show_in_menu,
			'show_in_nav_menus'  => $show_in_nav_menus,
			'show_tagcloud'      => $show_tagcloud,
			'show_in_quick_edit' => $show_in_quick_edit,
			'show_admin_column'  => $show_admin_column,
			'capabilities'       => $capabilities,
			'rewrite'            => $rewrite,
			'query_var'          => $query_var,
			'show_in_rest'       => $show_in_rest,
			'rest_base'          => $rest_base,
		);

		$other_args = array(
			'rest_base',
			'rest_namespace',
			'rest_controller_class',
			'meta_box_cb',
			'default_term',
			'sort',
			'args',
		);

		foreach ( $other_args as $arg ) {
			if ( isset( $taxonomy_args[$arg] ) ) {
				$args[$arg] = $taxonomy_args[$arg];
			}
		}

		register_taxonomy( $taxonomy, $taxonomy_args['post_types'], $args );
	}

	/**
	 * Get taxonomy labels.
	 *
	 * @return array
	 */
	private function get_taxonomy_labels() {
		$taxonomy_args = $this->args;

		$labels = array(
			'name'                       => $taxonomy_args['plural'],
			'singular_name'              => $taxonomy_args['singular'],
			// translators: %s is the plural name of the taxonomy.
			'search_items'               => sprintf( __( 'Search %s', 'chisel' ), $taxonomy_args['plural'] ),
			// translators: %s is the plural name of the taxonomy.
			'popular_items'              => sprintf( __( 'Popular %s', 'chisel' ), $taxonomy_args['plural'] ),
			// translators: %s is the plural name of the taxonomy.
			'all_items'                  => sprintf( __( 'All %s', 'chisel' ), $taxonomy_args['plural'] ),
			// translators: %s is the singular name of the taxonomy.
			'parent_item'                => sprintf( __( 'Parent %s', 'chisel' ), $taxonomy_args['singular'] ),
			// translators: %s is the singular name of the taxonomy.
			'parent_item_colon'          => sprintf( __( 'Parent %s:', 'chisel' ), $taxonomy_args['singular'] ),
			// translators: %s is the singular name of the taxonomy.
			'edit_item'                  => sprintf( __( 'Edit %s', 'chisel' ), $taxonomy_args['singular'] ),
			// translators: %s is the singular name of the taxonomy.
			'view_item'                  => sprintf( __( 'View %s', 'chisel' ), $taxonomy_args['singular'] ),
			// translators: %s is the singular name of the taxonomy.
			'update_item'                => sprintf( __( 'Update %s', 'chisel' ), $taxonomy_args['singular'] ),
			// translators: %s is the singular name of the taxonomy.
			'add_new_item'               => sprintf( __( 'Add New %s', 'chisel' ), $taxonomy_args['singular'] ),
			// translators: %s is the singular name of the taxonomy.
			'new_item_name'              => sprintf( __( 'New %s Name', 'chisel' ), $taxonomy_args['singular'] ),
			// translators: %s is the plural name of the taxonomy.
			'separate_items_with_commas' => sprintf( __( 'Separate %s with commas', 'chisel' ), $taxonomy_args['plural'] ),
			// translators: %s is the plural name of the taxonomy.
			'add_or_remove_items'        => sprintf( __( 'Add or remove %s', 'chisel' ), $taxonomy_args['plural'] ),
			// translators: %s is the plural name of the taxonomy.
			'choose_from_most_used'      => sprintf( __( 'Choose from the most used %s', 'chisel' ), $taxonomy_args['plural'] ),
			// translators: %s is the plural name of the taxonomy.
			'not_found'                  => sprintf( __( 'No %s found', 'chisel' ), $taxonomy_args['plural'] ),
			'no_terms'                   => __( 'No terms', 'chisel' ),
			// translators: %s is the singular name of the taxonomy.
			'filter_by_item'             => sprintf( __( 'Filter by %s', 'chisel' ), $taxonomy_args['singular'] ),
			// translators: %s is the plural name of the taxonomy.
			'items_list_navigation'      => sprintf( __( '%s list navigation', 'chisel' ), $taxonomy_args['plural'] ),
			// translators: %s is the plural name of the taxonomy.
			'items_list'                 => sprintf( __( '%s list', 'chisel' ), $taxonomy_args['plural'] ),
			'most_used'                  => _x( 'Most Used', 'taxonomy', 'chisel' ),
			// translators: %s is the plural name of the taxonomy.
			'back_to_items'              => sprintf( __( '← Back to %s', 'chisel' ), $taxonomy_args['plural'] ),
			// translators: %s is the singular name of the taxonomy.
			'item_link'                  => sprintf( __( '%s link', 'chisel' ), $taxonomy_args['singular'] ),
			// translators: %s is the singular name of the taxonomy.
			'item_link_description'      => sprintf( __( 'A link to a %s', 'chisel' ), $taxonomy_args['singular'] ),
		);

		$custom_labels = isset( $taxonomy_args['labels'] ) ? $taxonomy_args['labels'] : array();

		return wp_parse_args( $custom_labels, $labels );
	}
}
