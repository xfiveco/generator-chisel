<?php

namespace Chisel;

/**
 * ACF related functionalities.
 *
 * @package Chisel
 */
class Acf implements Instance {

	/**
	 * ACF options pages.
	 *
	 * @var array
	 */
	protected $acf_options_pages = array();

	/**
	 * ACF options sub pages.
	 *
	 * @var array
	 */
	protected $acf_options_sub_pages = array();

	/**
	 * Class constructor.
	 */
	private function __construct() {
		$this->set_properties();
		$this->action_hooks();
		$this->filter_hooks();

		if ( class_exists( '\ACF_Admin_Internal_Post_Type_List' ) ) {
			\Chisel\AcfSync::get_instance();
		}
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {
		$this->set_options_pages();
		$this->set_options_sub_pages();
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
		add_action( 'acf/init', array( $this, 'options_pages' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
	}

	/**
	 * Set ACF options pages.
	 */
	public function set_options_pages() {
		$this->acf_options_pages = array(
			// phpcs:disable
			// array(
			// 	'menu_slug'  => 'theme-settings',
			// 	'page_title' => __( 'Theme Settings', 'chisel' ),
			// ),
			// phpcs:enable
		);
	}

	/**
	 * Set ACF options sub pages.
	 */
	public function set_options_sub_pages() {
		$this->acf_options_sub_pages = array(
			// phpcs:disable
			// array(
			// 	'menu_slug'   => 'theme-sub-settings',
			// 	'page_title'  => __( 'Theme Sub settings', 'chisel' ),
			// 	'menu_title'  => __( 'Theme Sub settings', 'chisel' ),
			// 	'parent_slug' => 'theme-settings',
			// ),
			// phpcs:enable
		);
	}

	/**
	 * Register ACF options pages.
	 */
	public function options_pages() {
		$this->acf_options_pages     = apply_filters( 'chisel_acf_options_pages', $this->acf_options_pages );
		$this->acf_options_sub_pages = apply_filters( 'chisel_acf_options_sub_pages', $this->acf_options_sub_pages );

		if ( $this->acf_options_pages && function_exists( 'acf_add_options_page' ) ) {
			foreach ( $this->acf_options_pages as $data ) {
				$this->register_options_page( $data, 'page' );
			}
		}

		if ( $this->acf_options_sub_pages && function_exists( 'acf_add_options_sub_page' ) ) {
			foreach ( $this->acf_options_sub_pages as $data ) {
				$this->register_options_page( $data, 'subpage' );
			}
		}
	}

	/**
	 * Register ACF options sub pages.
	 *
	 * @param array  $data
	 * @param string $type  page or subpage.
	 *
	 * @return void
	 */
	protected function register_options_page( $data, $type = 'page' ) {
		$options_page_args = array(
			'page_title'      => $data['page_title'],
			'menu_title'      => isset( $data['menu_title'] ) ? $data['menu_title'] : $data['page_title'],
			'menu_slug'       => $data['menu_slug'],
			'capability'      => isset( $data['capability'] ) ? $data['capability'] : 'edit_posts',
			'position'        => isset( $data['position'] ) ? $data['position'] : 45,
			'redirect'        => isset( $data['redirect'] ) ? $data['redirect'] : true,
			'icon_url'        => isset( $data['icon_url'] ) ? $data['icon_url'] : 'dashicons-screenoptions',
			'post_id'         => isset( $data['post_id'] ) ? $data['post_id'] : 'options',
			'autoload'        => isset( $data['autoload'] ) ? $data['autoload'] : false,
			'update_button'   => isset( $data['update_button'] ) ? $data['update_button'] : __( 'Update', 'chisel' ),
			'updated_message' => isset( $data['updated_message'] ) ? $data['updated_message'] : __( 'Options Updated', 'chisel' ),
			'parent_slug'     => isset( $data['parent_slug'] ) ? $data['parent_slug'] : '',
		);

		if ( $type === 'subpage' ) {
			acf_add_options_sub_page( $options_page_args );
		} else {
			acf_add_options_page( $options_page_args );
		}
	}

	/**
	 * Get the acf field value. Acf get_field() wrapper. If ACF plugin is not active, returns false.
	 *
	 * @param string   $selector
	 * @param int|bool $post_id
	 * @param bool     $format_value
	 * @param bool     $escape_html
	 *
	 * @return mixed
	 */
	public static function get_field( $selector, $post_id = false, $format_value = true, $escape_html = false ) {
		if ( function_exists( 'get_field' ) ) {
			return get_field( $selector, $post_id, $format_value, $escape_html );
		}

		return false;
	}

	/**
	 * Update the acf field value. Acf update_field() wrapper. If ACF plugin is not active, returns false.
	 *
	 * @param string   $selector
	 * @param mixed    $value
	 * @param int|bool $post_id
	 *
	 * @return int|bool
	 */
	public static function update_field( $selector, $value, $post_id = false ) {
		if ( function_exists( 'update_field' ) ) {
			return update_field( $selector, $value, $post_id );
		}

		return false;
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
