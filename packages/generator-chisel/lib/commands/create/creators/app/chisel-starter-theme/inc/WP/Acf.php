<?php

namespace Chisel\WP;

use Chisel\Interfaces\InstanceInterface;
use Chisel\Interfaces\HooksInterface;
use Chisel\Traits\Singleton;
use Chisel\Factories\RegisterAcfOptionsPage;
use Chisel\Enums\AcfOptionsPageType;

/**
 * ACF related functionalities.
 *
 * @package Chisel
 */
final class Acf implements InstanceInterface, HooksInterface {

	use Singleton;

	/**
	 * ACF options pages.
	 *
	 * @var array
	 */
	private array $acf_options_pages = array();

	/**
	 * ACF options sub pages.
	 *
	 * @var array
	 */
	private array $acf_options_sub_pages = array();

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
		$this->set_options_pages();
		$this->set_options_sub_pages();
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'acf/init', array( $this, 'options_pages' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
	}

	/**
	 * Set ACF options pages.
	 */
	private function set_options_pages(): void {
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
	private function set_options_sub_pages(): void {
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
	public function options_pages(): void {
		$this->acf_options_pages     = apply_filters( 'chisel_acf_options_pages', $this->acf_options_pages );
		$this->acf_options_sub_pages = apply_filters( 'chisel_acf_options_sub_pages', $this->acf_options_sub_pages );

		if ( is_array( $this->acf_options_pages ) && ! empty( $this->acf_options_pages ) && function_exists( 'acf_add_options_page' ) ) {
			foreach ( $this->acf_options_pages as $data ) {
				$this->register_options_page( $data, 'page' );
			}
		}

		if ( is_array( $this->acf_options_sub_pages ) && ! empty( $this->acf_options_sub_pages ) && function_exists( 'acf_add_options_sub_page' ) ) {
			foreach ( $this->acf_options_sub_pages as $data ) {
				$this->register_options_page( $data, 'subpage' );
			}
		}
	}

	/**
	 * Register ACF options pages.
	 *
	 * @param array                     $data
	 * @param AcfOptionsPageType|string $type
	 *
	 * @return void
	 */
	private function register_options_page( array $data, AcfOptionsPageType|string $type = AcfOptionsPageType::Page ): void {
		( new RegisterAcfOptionsPage( $data, $type ) )->register();
	}
}
