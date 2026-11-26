<?php

namespace Chisel\WP;

use Chisel\Traits\HooksSingleton;
use Chisel\Factories\RegisterAcfOptionsPage;
use Chisel\Enums\AcfOptionsPageType;

/**
 * ACF related functionalities.
 *
 * @package Chisel
 */
final class Acf {

	use HooksSingleton;

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
	 * Whether ACF options are saved as autoloaded (fetched with WordPress's first query instead of one or two
	 * queries per field). The default for options pages that don't set `autoload` and for options saved
	 * outside an options page (code, imports, REST tools).
	 *
	 * @var bool
	 */
	private bool $options_autoload = true;

	/**
	 * Set properties.
	 */
	public function set_properties(): void {
		$this->options_autoload = (bool) apply_filters( 'chisel_acf_options_autoload', $this->options_autoload );
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'acf/init', array( $this, 'options_autoload' ) );
		add_action( 'acf/init', array( $this, 'options_pages' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {}

	/**
	 * Make `chisel_acf_options_autoload` ACF's own default for saving options. An options page's `autoload`
	 * still wins on that page's screen: ACF sets it while saving the page.
	 */
	public function options_autoload(): void {
		acf_update_setting( 'autoload', $this->options_autoload );
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
	 * Get ACF options pages.
	 *
	 * @return array
	 */
	public static function get_options_pages(): array {
		return self::get_instance()->acf_options_pages;
	}

	/**
	 * Get ACF options sub pages.
	 *
	 * @return array
	 */
	public static function get_options_sub_pages(): array {
		return self::get_instance()->acf_options_sub_pages;
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
		$data['autoload'] ??= $this->options_autoload;

		( new RegisterAcfOptionsPage( $data, $type ) )->register();
	}
}
