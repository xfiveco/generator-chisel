<?php

namespace Chisel\Factories;

/**
 * Custom post types wrapper class.
 *
 * @package Chisel
 */
final class RegisterCustomPostType {

	/**
	 * Post type.
	 *
	 * @var string
	 */
	private string $post_type;

	/**
	 * Arguments.
	 *
	 * @var array
	 */
	private array $args;

	/**
	 * Default arguments.
	 *
	 * @var array
	 */
	private array $defaults;

	/**
	 * Class constructor.
	 *
	 * @param string $post_type Post type.
	 * @param array  $args Arguments.
	 * @param array  $defaults Default arguments.
	 */
	public function __construct( string $post_type, array $args, array $defaults = array() ) {
		$this->post_type = $post_type;
		$this->args      = $args;
		$this->defaults  = $defaults;
	}

	/**
	 * Register custom post type.
	 */
	public function register_post_type(): void {
		$post_type      = $this->post_type;
		$post_type_args = $this->args;
		$defaults       = $this->defaults;

		$default_supports = isset( $defaults['supports'] )
			? (array) apply_filters( 'chisel_default_post_type_supports_' . $post_type, $defaults['supports'] )
			: array();
		$default_rewrite  = isset( $defaults['rewrite_args'] )
			? (array) apply_filters( 'chisel_default_post_type_rewrite_args_' . $post_type, $defaults['rewrite_args'] )
			: array();

		$labels = $this->get_post_type_labels();

		$default_rewrite['slug'] = $post_type;

		$description         = $post_type_args['description'] ?? '';
		$public              = (bool) ( $post_type_args['public'] ?? true );
		$hierarchical        = (bool) ( $post_type_args['hierarchical'] ?? false ); // true for pages like post type.
		$exclude_from_search = (bool) ( $post_type_args['exclude_from_search'] ?? ! $public );
		$publicly_queryable  = (bool) ( $post_type_args['publicly_queryable'] ?? $public );
		$show_ui             = (bool) ( $post_type_args['show_ui'] ?? $public );  // show in admin.
		$show_in_menu        = $post_type_args['show_in_menu'] ?? $public; // bool|string. If or where to show in admin menu - show_ui must be true. If a string of an existing top level menu ('tools.php' or 'edit.php?post_type=page', for example), the post type will be placed as a sub-menu of that.
		$show_in_nav_menus   = (bool) ( $post_type_args['show_in_nav_menus'] ?? $public );
		$show_in_admin_bar   = (bool) ( $post_type_args['show_in_admin_bar'] ?? $show_in_menu );
		$show_in_rest        = (bool) ( $post_type_args['show_in_rest'] ?? true ); // set to false to disable block editor. Supports array must also include 'editor'.
		$menu_position       = $post_type_args['menu_position'] ?? null; // int|null are valid.
		$menu_icon           = (string) ( $post_type_args['menu_icon'] ?? 'dashicons-admin-post' );
		$capability_type     = $post_type_args['capability_type'] ?? 'post';
		$capabilities        = (array) ( $post_type_args['capabilities'] ?? array() );
		$supports            = isset( $post_type_args['supports'] ) ? wp_parse_args( (array) $post_type_args['supports'], $default_supports ) : $default_supports;
		$has_archive         = (bool) ( $post_type_args['has_archive'] ?? true );
		$rewrite             = isset( $post_type_args['rewrite'] ) ? wp_parse_args( (array) $post_type_args['rewrite'], $default_rewrite ) : $default_rewrite;
		$query_var           = $post_type_args['query_var'] ?? $post_type;
		$can_export          = (bool) ( $post_type_args['can_export'] ?? true );

		if ( in_array( 'thumbnail', $supports, true ) ) {
			add_filter(
				'chisel_post_thumbnails_post_types',
				function ( array $pts ) use ( $post_type ): array {
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
	 * Get post type labels.
	 *
	 * @return array
	 */
	private function get_post_type_labels(): array {
		$post_type_args = $this->args;

		if ( empty( $post_type_args['plural'] ) ) {
			$post_type_args['plural'] = __( 'Items', 'chisel' );
		}

		if ( empty( $post_type_args['singular'] ) ) {
			$post_type_args['singular'] = __( 'Item', 'chisel' );
		}

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

		$custom_labels = isset( $post_type_args['labels'] ) && is_array( $post_type_args['labels'] ) ? $post_type_args['labels'] : array();

		return wp_parse_args( $custom_labels, $labels );
	}
}
