<?php

namespace Chisel\WP\Custom;

use Chisel\Traits\HooksSingleton;

/**
 * ACF related functionality.
 *
 * @package Chisel
 */
class Acf {

	use HooksSingleton;

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'chisel_acf_options_pages', array( $this, 'register_acf_options_pages' ) );
		add_filter( 'chisel_acf_options_sub_pages', array( $this, 'register_acf_options_sub_pages' ) );
	}

	/**
	 * Register custom ACF options pages.
	 *
	 * @param array $options_pages The options pages.
	 *
	 * @return array
	 */
	public function register_acf_options_pages( $options_pages ) {
		// phpcs:disable -- Example of custom ACF options page
		// $options_pages[] = array(
		// 	'menu_slug'  => 'theme-settings',
		// 	'page_title' => __( 'Theme Settings', 'chisel' ),
		// );
		// phpcs:enable

		return $options_pages;
	}

	/**
	 * Register custom ACF options sub pages.
	 *
	 * @param array $options_sub_pages The options sub pages.
	 *
	 * @return array
	 */
	public function register_acf_options_sub_pages( $options_sub_pages ) {
		// phpcs:disable -- Example of custom ACF options sub page
		// $options_sub_pages[] = array(
		// 	'menu_slug'   => 'theme-sub-settings',
		// 	'page_title'  => __( 'Theme Sub settings', 'chisel' ),
		// 	'menu_title'  => __( 'Theme Sub settings', 'chisel' ),
		// 	'parent_slug' => 'theme-settings',
		// );
		// phpcs:enable

		return $options_sub_pages;
	}
}
