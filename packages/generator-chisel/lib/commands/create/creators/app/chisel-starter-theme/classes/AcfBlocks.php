<?php

namespace Chisel;

use Timber\Timber;
use Chisel\ChiselCache;

/**
 * ACF blocks related functionalities.
 *
 * @package Chisel
 */
class AcfBlocks extends RegisterBlocks implements Instance {

	/**
	 * Blocks twig file base path.
	 *
	 * @var string
	 */
	protected $blocks_twig_base_path;

	/**
	 * Class constructor.
	 */
	private function __construct() {
		$this->set_properties();

		parent::__construct( 'acf' );

		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {
		$this->blocks_twig_base_path = apply_filters( 'chisel_blocks_twig_base_path', 'src/blocks-acf/' );
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
		$this->register_custom_blocks();
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
			$locations[] = array( $this->blocks_path_src . '/' . $block . '/' );
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
			$paths[] = $this->blocks_path_src . '/' . $block . '/acf-json';
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

	/**
	 * Render ACF block.
	 *
	 * @param array  $block The block.
	 * @param string $content The content.
	 * @param bool   $is_preview Is preview.
	 * @param int    $post_id The post ID.
	 *
	 * @return void
	 */
	public static function acf_block_render( $block, $content = '', $is_preview = false, $post_id = 0 ) {
		$context = Timber::context();

		$block_slug = str_replace( 'chisel/', '', $block['name'] );

		$slug                  = 'b-' . $block_slug;
		$context['block']      = $block;
		$context['post_id']    = $post_id;
		$context['slug']       = $slug;
		$context['is_preview'] = $is_preview;
		$context['fields']     = get_fields();
		$classes               = array_merge(
			array( $slug ),
			isset( $block['className'] ) ? array( $block['className'] ) : array(),
			$is_preview ? array( 'is-preview' ) : array(),
			$block['supports']['align'] ? array( 'align' . $context['block']['align'] ) : array(),
		);

		$context['block']['class_names'] = $classes;
		$context['block']['block_id']    = isset( $block['anchor'] ) ? $block['anchor'] : $block['id'];

		// allow to use filters to manipulate the output.
		$context = apply_filters( 'chisel_timber_acf_blocks_data', $context );
		$context = apply_filters( 'chisel_timber_acf_blocks_data_' . $slug, $context );
		$context = apply_filters( 'chisel_timber_acf_blocks_data_' . $block['id'], $context );

		$context['wrapper_attributes'] = get_block_wrapper_attributes(
			array(
				'id'    => $context['block']['block_id'],
				'class' => implode( ' ', $context['block']['class_names'] ),
			)
		);

		Timber::render( self::get_instance()->blocks_twig_base_path . $block_slug . '/' . $block_slug . '.twig', $context, ChiselCache::expiry() );
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
