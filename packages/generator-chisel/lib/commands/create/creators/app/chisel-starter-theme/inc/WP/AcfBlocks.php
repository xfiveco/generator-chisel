<?php

namespace Chisel\WP;

use Timber\Timber;
use Chisel\Interface\InstanceInterface;
use Chisel\Interface\HooksInterface;
use Chisel\Trait\Singleton;
use Chisel\Factory\RegisterBlocks;

/**
 * ACF blocks related functionalities.
 *
 * @package Chisel
 */
class AcfBlocks implements InstanceInterface, HooksInterface {

	use Singleton;

	/**
	 * Register blocks factory.
	 *
	 * @var RegisterBlocks
	 */
	private $register_blocks_factory;

	/**
	 * Blocks.
	 *
	 * @var array
	 */
	private $blocks = array();

	/**
	 * Blocks twig file base path.
	 *
	 * @var string
	 */
	public $blocks_twig_base_path;

	/**
	 * Class constructor.
	 */
	private function __construct() {
		$this->register_blocks_factory = new RegisterBlocks( 'acf' );
		$this->blocks                  = $this->register_blocks_factory->get_blocks();

		add_action( 'after_setup_theme', array( $this, 'set_properties' ), 7 );

		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {
		$this->blocks_twig_base_path = 'build/blocks-acf/';
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
		add_action( 'acf/init', array( $this, 'register_blocks' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
		add_filter( 'timber/locations', array( $this, 'tiwg_files_locations' ) );
		add_filter( 'acf/settings/load_json', array( $this, 'load_acf_field_group' ) );
		add_filter( 'acf/settings/save_json', array( $this, 'save_acf_field_group' ) );
	}

	/**
	 * Register ACF blocks and their assets.
	 */
	public function register_blocks() {
		$this->register_blocks_factory->register_custom_blocks();
	}

	/**
	 * Add custom Twig files locations.
	 *
	 * @param array $locations The locations.
	 * @return array
	 */
	public function tiwg_files_locations( $locations ) {
		if ( ! is_array( $this->blocks ) || ! $this->blocks ) {
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
	public function load_acf_field_group( $paths ) {
		if ( ! is_array( $this->blocks ) || ! $this->blocks ) {
			return;
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
	public function save_acf_field_group( $path ) {

		$action    = isset( $_REQUEST['action'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['action'] ) ) : ''; // phpcs:ignore
		$post_type = isset( $_REQUEST['post_type'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['post_type'] ) ) : ''; // phpcs:ignore

		if ( $action === 'editpost' && $post_type === 'acf-field-group' ) {
			$location = isset( $_REQUEST['acf_field_group']['location'] ) ? $_REQUEST['acf_field_group']['location'] : array(); // phpcs:ignore

			foreach ( $location as $group ) {
				foreach ( $group as $rules ) {
					if ( sanitize_text_field( $rules['param'] ) === 'block' && sanitize_text_field( $rules['operator'] ) === '==' ) {
						$block_name = explode( '/', sanitize_text_field( $rules['value'] ) )[1];

						if ( ! $block_name ) {
							return $path;
						}

						return $this->blocks_path_src . '/' . $block_name . '/acf-json';
					}
				}
			}
		}

		return $path;
	}
}
