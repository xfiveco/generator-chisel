<?php

namespace Chisel\Factory;

/**
 * Custom post types wrapper class.
 *
 * @package Chisel
 */
class RegisterAcfOptionsPage {

	/**
	 * Page arguments.
	 *
	 * @var array
	 */
	private $args;

	/**
	 * Page type - page or subpage.
	 *
	 * @var array
	 */
	private $type;

	/**
	 * Class constructor.
	 *
	 * @param array  $args  page arguments.
	 * @param string $type  page or subpage.
	 */
	public function __construct( $args, $type = 'page' ) {
		$this->args = $args;
		$this->type = $type;
	}

	/**
	 * Register ACF options page.
	 */
	public function register() {
		$options_page_args = array(
			'page_title'      => $this->args['page_title'],
			'menu_title'      => isset( $this->args['menu_title'] ) ? $this->args['menu_title'] : $this->args['page_title'],
			'menu_slug'       => $this->args['menu_slug'],
			'capability'      => isset( $this->args['capability'] ) ? $this->args['capability'] : 'edit_posts',
			'position'        => isset( $this->args['position'] ) ? $this->args['position'] : 45,
			'redirect'        => isset( $this->args['redirect'] ) ? $this->args['redirect'] : true,
			'icon_url'        => isset( $this->args['icon_url'] ) ? $this->args['icon_url'] : 'dashicons-screenoptions',
			'post_id'         => isset( $this->args['post_id'] ) ? $this->args['post_id'] : 'options',
			'autoload'        => isset( $this->args['autoload'] ) ? $this->args['autoload'] : false,
			'update_button'   => isset( $this->args['update_button'] ) ? $this->args['update_button'] : __( 'Update', 'chisel' ),
			'updated_message' => isset( $this->args['updated_message'] ) ? $this->args['updated_message'] : __( 'Options Updated', 'chisel' ),
			'parent_slug'     => isset( $this->args['parent_slug'] ) ? $this->args['parent_slug'] : '',
		);

		if ( $this->type === 'subpage' ) {
			acf_add_options_sub_page( $options_page_args );
		} else {
			acf_add_options_page( $options_page_args );
		}
	}
}
