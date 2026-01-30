<?php

namespace Chisel\WP;

use Timber\Timber;
use Chisel\Traits\HooksSingleton;
use Chisel\Factories\RegisterBlocks;
use Chisel\Traits\PageBlocks;
use Chisel\Helpers\BlocksHelpers;
use Chisel\Helpers\AssetsHelpers;

/**
 * ACF blocks related functionalities.
 *
 * @package Chisel
 */
final class AcfBlocks {

	use HooksSingleton;
	use PageBlocks;

	/**
	 * Register blocks factory.
	 *
	 * @var RegisterBlocks
	 */
	private RegisterBlocks $register_blocks_factory;

	/**
	 * Blocks.
	 *
	 * @var array
	 */
	private array $blocks = array();

	/**
	 * Blocks twig file base path.
	 *
	 * @var string
	 */
	public string $blocks_twig_base_path = '';

	/**
	 * Set properties.
	 */
	public function set_properties(): void {
		$this->register_blocks_factory = new RegisterBlocks( 'acf' );
		$this->blocks                  = $this->register_blocks_factory->get_blocks();
		$this->blocks_twig_base_path   = 'build/blocks-acf/';
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'wp_print_styles', array( $this, 'dequeue_blocks_styles' ), 999 );
		add_action( 'acf/init', array( $this, 'register_blocks' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'timber/locations', array( $this, 'tiwg_files_locations' ) );
		add_filter( 'acf/settings/load_json', array( $this, 'load_acf_field_group' ) );
		add_filter( 'acf/settings/save_json', array( $this, 'save_acf_field_group' ) );
	}

	/**
	 * Register ACF blocks and their assets.
	 */
	public function register_blocks(): void {
		$this->register_blocks_factory->register_custom_blocks();
	}

	/**
	 * Add custom Twig files locations.
	 *
	 * @param array $locations The locations.
	 * @return array
	 */
	public function tiwg_files_locations( array $locations ): array {
		if ( ! is_array( $this->blocks ) || empty( $this->blocks ) ) {
			return $locations;
		}

		foreach ( $this->blocks as $block ) {
			$locations[] = array( $this->register_blocks_factory->get_blocks_path_src() . '/' . $block . '/' );
		}

		return $locations;
	}

	/**
	 * Load ACF field group.
	 *
	 * @param array $paths The paths.
	 * @return array
	 */
	public function load_acf_field_group( array $paths ): array {
		if ( ! is_array( $this->blocks ) || empty( $this->blocks ) ) {
			return $paths;
		}

		foreach ( $this->blocks as $block ) {
			$paths[] = $this->register_blocks_factory->get_blocks_path_src() . '/' . $block . '/acf-json';
		}

		return $paths;
	}

	/**
	 * Save ACF field group.
	 *
	 * @param string $path The path.
	 * @return string
	 */
	public function save_acf_field_group( string $path ): string {

		$action    = isset( $_REQUEST['action'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['action'] ) ) : ''; // phpcs:ignore
		$post_type = isset( $_REQUEST['post_type'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['post_type'] ) ) : ''; // phpcs:ignore

		if ( $action === 'editpost' && $post_type === 'acf-field-group' ) {
			$location = isset( $_REQUEST['acf_field_group']['location'] ) ? $_REQUEST['acf_field_group']['location'] : array(); // phpcs:ignore

			foreach ( $location as $group ) {
				foreach ( (array) $group as $rules ) {
					if ( sanitize_text_field( $rules['param'] ) === 'block' && sanitize_text_field( $rules['operator'] ) === '==' ) {
						$block_name = explode( '/', sanitize_text_field( $rules['value'] ) )[1];

						if ( ! $block_name ) {
							return $path;
						}

						return $this->register_blocks_factory->get_blocks_path_src() . '/' . $block_name . '/acf-json';
					}
				}
			}
		}

		return $path;
	}

	/**
	 * Dequeue blocks styles that are not used on current page and add inline critical css for blocks.
	 *
	 * @return void
	 */
	public function dequeue_blocks_styles(): void {
		if ( is_admin() ) {
			return;
		}

		$blocks_used_on_page = $this->get_content_blocks_names();
		$blocks              = $this->blocks;

		if ( ! empty( $blocks ) ) {
			$blocks_path = $this->register_blocks_factory->get_blocks_path();
			$blocks_url  = $this->register_blocks_factory->get_blocks_url();

			foreach ( $blocks as $block_name ) {
				if ( ! in_array( $block_name, $blocks_used_on_page, true ) ) {
					wp_dequeue_style( 'block-acf-' . $block_name . '-style' );
				} else {
					$block_critical_css = $blocks_path . '/' . $block_name . '/script.css';

					if ( is_file( $block_critical_css ) ) {
						$css = BlocksHelpers::get_block_inline_css( $blocks_url, $block_name );

						if ( $css ) {
							$add = wp_add_inline_style( AssetsHelpers::get_final_handle( 'main' ), $css );
						}
					}
				}
			}
		}
	}
}
