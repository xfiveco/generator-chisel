<?php

namespace Chisel;

/**
 * Custom post types and taxonomies wrapper class.
 *
 * @package Chisel
 */
class RegisterCustomObject {

	/**
	 * Object key.
	 *
	 * @var string
	 */
	protected $object_key;

	/**
	 * Arguments.
	 *
	 * @var array
	 */
	protected $args = array();

	/**
	 * Default post type supports.
	 *
	 * @var array
	 */
	protected $default_post_type_supports = array();

	/**
	 * Default post type rewrite args.
	 *
	 * @var array
	 */
	protected $default_post_type_rewrite_args = array();

	/**
	 * Default taxonomy rewrite args.
	 *
	 * @var array
	 */
	protected $default_taxonomy_rewrite_args = array();

	/**
	 * Default taxonomy capabilities.
	 *
	 * @var array
	 */
	protected $default_taxonomy_capabilities = array();

	/**
	 * Class constructor.
	 *
	 * @param string $object_key Object key - post type or a taxonomy key.
	 * @param array  $args Array of arguments.
	 * @param string $object_type Object type.
	 *
	 * @return void
	 */
	public function __construct( $object_key, $args, $object_type = 'post' ) {
		$this->args       = $args;
		$this->object_key = $object_key;

		$this->default_post_type_supports     = apply_filters( 'chisel_default_post_type_supports', array( 'title', 'page-attributes', 'revisions', 'author' ) );
		$this->default_post_type_rewrite_args = apply_filters(
			'chisel_default_post_type_rewrite_args',
			array(
				'slug'       => '',
				'with_front' => true,
				'feeds'      => true,
				'pages'      => true,
				'ep_mask'    => EP_PERMALINK,
			)
		);

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

		if ( $object_type === 'taxonomy' ) {
			$this->register_taxonomy();
		} else {
			$this->register_post_type();
		}
	}

	/**
	 * Register custom post types.
	 */
	public function register_post_type() {
		$post_type        = $this->object_key;
		$post_type_args   = $this->args;
		$default_supports = apply_filters( 'chisel_default_post_type_supports_' . $post_type, $this->default_post_type_supports );
		$default_rewrite  = apply_filters( 'chisel_default_post_type_supports_' . $post_type, $this->default_post_type_rewrite_args );

		$labels = $this->get_post_type_labels( $post_type_args );

		$default_rewrite['slug'] = $post_type;

		$description         = isset( $post_type_args['description'] ) ? $post_type_args['description'] : '';
		$public              = isset( $post_type_args['public'] ) ? $post_type_args['public'] : true;
		$hierarchical        = isset( $post_type_args['hierarchical'] ) ? $post_type_args['hierarchical'] : false; // true for pages like post type.
		$exclude_from_search = isset( $post_type_args['exclude_from_search'] ) ? $post_type_args['exclude_from_search'] : ! $public;
		$publicly_queryable  = isset( $post_type_args['publicly_queryable'] ) ? $post_type_args['publicly_queryable'] : $public;
		$show_ui             = isset( $post_type_args['show_ui'] ) ? $post_type_args['show_ui'] : $public;  // show in admin.
		$show_in_menu        = isset( $post_type_args['show_in_menu'] ) ? $post_type_args['show_in_menu'] : $public; // if or where to show in admin menu - show_ui must be true. If a string of an existing top level menu ('tools.php' or 'edit.php?post_type=page', for example), the post type will be placed as a sub-menu of that.
		$show_in_nav_menus   = isset( $post_type_args['show_in_nav_menus'] ) ? $post_type_args['show_in_nav_menus'] : $public;
		$show_in_admin_bar   = isset( $post_type_args['show_in_admin_bar'] ) ? $post_type_args['show_in_admin_bar'] : $show_in_menu;
		$show_in_rest        = isset( $post_type_args['show_in_rest'] ) ? $post_type_args['show_in_rest'] : true; // set to false to disable block editor. Supports array must also include 'editor'.
		$menu_position       = isset( $post_type_args['menu_position'] ) ? $post_type_args['menu_position'] : null;
		$menu_icon           = isset( $post_type_args['menu_icon'] ) ? $post_type_args['menu_icon'] : 'dashicons-admin-post';
		$capability_type     = isset( $post_type_args['capability_type'] ) ? $post_type_args['capability_type'] : 'post';
		$capabilities        = isset( $post_type_args['capabilities'] ) ? $post_type_args['capabilities'] : array();
		$supports            = isset( $post_type_args['supports'] ) ? wp_parse_args( $post_type_args['supports'], $default_supports ) : $default_supports;
		$has_archive         = isset( $post_type_args['has_archive'] ) ? $post_type_args['has_archive'] : true;
		$rewrite             = isset( $post_type_args['rewrite'] ) ? wp_parse_args( $post_type_args['rewrite'], $default_rewrite ) : $default_rewrite;
		$query_var           = isset( $post_type_args['query_var'] ) ? $post_type_args['query_var'] : $post_type;
		$can_export          = isset( $post_type_args['can_export'] ) ? $post_type_args['can_export'] : true;

		if ( in_array( 'thumbnail', $supports, true ) ) {
			add_filter(
				'chisel_post_thumbnails_post_types',
				function ( $pts ) use ( $post_type ) {
					$pts[] = $post_type;
					return $pts;
				}
			);
		}

		$args = array(
			'label'               => $post_type_args['plural'],
			'labels'              => $labels,
			'description'         => $description,
			'public'              => $public,
			'hierarchical'        => $hierarchical,
			'exclude_from_search' => $exclude_from_search,
			'publicly_queryable'  => $publicly_queryable,
			'show_ui'             => $show_ui,
			'show_in_menu'        => $show_in_menu,
			'show_in_nav_menus'   => $show_in_nav_menus,
			'show_in_admin_bar'   => $show_in_admin_bar,
			'show_in_rest'        => $show_in_rest,
			'menu_position'       => $menu_position,
			'menu_icon'           => $menu_icon,
			'capability_type'     => $capability_type,
			'capabilities'        => $capabilities,
			'supports'            => $supports,
			'has_archive'         => $has_archive,
			'rewrite'             => $rewrite,
			'query_var'           => $query_var,
			'can_export'          => $can_export,
		);

		$other_args = array(
			'rest_base',
			'rest_namespace',
			'rest_controller_class',
			'autosave_rest_controller_class',
			'revisions_rest_controller_class',
			'late_route_registration',
			'map_meta_cap',
			'register_meta_box_cb',
			'taxonomies',
			'template',
			'template_lock',
		);

		foreach ( $other_args as $arg ) {
			if ( isset( $post_type_args[$arg] ) ) {
				$args[$arg] = $post_type_args[$arg];
			}
		}

		register_post_type( $post_type, $args );
	}

	/**
	 * Register custom taxonomies.
	 */
	public function register_taxonomy() {
		$taxonomy             = $this->object_key;
		$taxonomy_args        = $this->args;
		$default_capabilities = apply_filters( 'chisel_default_taxonomy_capabilities_' . $taxonomy, $this->default_taxonomy_capabilities );
		$default_rewrite      = apply_filters( 'chisel_default_taxonomy_rewrite_args_' . $taxonomy, $this->default_taxonomy_rewrite_args );

		$labels = $this->get_taxonomy_labels( $taxonomy_args );

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
	 * Get post type labels.
	 *
	 * @param array $post_type_args Post type.
	 *
	 * @return array
	 */
	protected function get_post_type_labels( $post_type_args ) {
		$labels = array(
			'name'                     => $post_type_args['plural'],
			'singular_name'            => $post_type_args['singular'],
			'add_new'                  => __( 'Add New', 'chisel' ),
			// translators: %s is the singular name of the post type.
			'add_new_item'             => sprintf( __( 'Add New %s', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'edit_item'                => sprintf( __( 'Edit %s', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'new_item'                 => sprintf( __( 'New %s', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the plural name of the post type.
			'all_items'                => sprintf( __( 'All %s', 'chisel' ), $post_type_args['plural'] ),
			// translators: %s is the singular name of the post type.
			'view_item'                => sprintf( __( 'View %s', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the plural name of the post type.
			'search_items'             => sprintf( __( 'Search %s', 'chisel' ), $post_type_args['plural'] ),
			// translators: %s is the plural name of the post type.
			'not_found'                => sprintf( __( 'No %s found', 'chisel' ), $post_type_args['plural'] ),
			// translators: %s is the plural name of the post type.
			'not_found_in_trash'       => sprintf( __( 'No %s found in Trash', 'chisel' ), $post_type_args['plural'] ),
			'parent_item_colon'        => '',
			'menu_name'                => $post_type_args['plural'],
			// translators: %s is the singular name of the post type.
			'archives'                 => sprintf( __( '%s Archives', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'attributes'               => sprintf( __( '%s Attributes', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'insert_into_item'         => sprintf( __( 'Insert into %s', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'uploaded_to_this_item'    => sprintf( __( 'Uploaded to this %s', 'chisel' ), $post_type_args['singular'] ),
			'featured_image'           => __( 'Featured Image', 'chisel' ),
			'set_featured_image'       => __( 'Set featured image', 'chisel' ),
			'remove_featured_image'    => __( 'Remove featured image', 'chisel' ),
			'use_featured_image'       => __( 'Use as featured image', 'chisel' ),
			// translators: %s is the plural name of the post type.
			'filter_items_list'        => sprintf( __( 'Filter %s list', 'chisel' ), $post_type_args['plural'] ),
			'filter_by_date'           => __( 'Filter by date', 'chisel' ),
			// translators: %s is the plural name of the post type.
			'items_list_navigation'    => sprintf( __( '%s list navigation', 'chisel' ), $post_type_args['plural'] ),
			// translators: %s is the plural name of the post type.
			'items_list'               => sprintf( __( '%s list', 'chisel' ), $post_type_args['plural'] ),
			// translators: %s is the singular name of the post type.
			'item_published'           => sprintf( __( '%s published', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'item_published_privately' => sprintf( __( '%s published privately', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'item_reverted_to_draft'   => sprintf( __( '%s reverted to draft', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'item_scheduled'           => sprintf( __( '%s scheduled', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'item_updated'             => sprintf( __( '%s updated', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'item_trashed'             => sprintf( __( '%s trashed', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'item_untrashed'           => sprintf( __( '%s untrashed', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'item_link'                => sprintf( __( '%s link', 'chisel' ), $post_type_args['singular'] ),
			// translators: %s is the singular name of the post type.
			'item_link_description'    => sprintf( __( 'A link to a %s', 'chisel' ), $post_type_args['singular'] ),
		);

		$custom_labels = isset( $post_type_args['labels'] ) ? $post_type_args['labels'] : array();

		return wp_parse_args( $custom_labels, $labels );
	}

	/**
	 * Get taxonomy labels.
	 *
	 * @param array $taxonomy_args Taxonomy.
	 *
	 * @return array
	 */
	protected function get_taxonomy_labels( $taxonomy_args ) {
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
