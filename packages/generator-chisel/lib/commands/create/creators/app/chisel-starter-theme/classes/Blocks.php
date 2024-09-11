<?php

namespace Chisel;

use Timber\Timber;

/**
 * Blocks related functionalities.
 *
 * @package Chisel
 */
class Blocks extends RegisterBlocks implements Instance {

	/**
	 * Chisel blocks category.
	 *
	 * @var string
	 */
	protected $blocks_category;


	/**
	 * Blocks patterns categories.
	 *
	 * @var array
	 */
	protected $block_patterns_categories = array();

	/**
	 * Blocks twig file base path.
	 *
	 * @var string
	 */
	protected $blocks_twig_base_path = 'src/blocks/';

	/**
	 * Class constructor.
	 */
	private function __construct() {
		$this->set_properties();

		parent::__construct( 'wp' );

		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {
		$this->blocks_category           = 'chisel-blocks';
		$this->block_patterns_categories = array(
			'cta' => array(
				'label'       => __( 'Call to Action', 'chisel' ),
				'description' => __( 'Call to Action Sections.', 'chisel' ),
			),
		);
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'after_setup_theme', array( $this, 'blocks_theme_supports' ) );
		add_action( 'init', array( $this, 'register_block_patterns_categories' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
		add_filter( 'block_categories_all', array( $this, 'block_categories' ) );
		add_filter( 'timber/locations', array( $this, 'tiwg_files_locations' ) );
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 3 );

		add_filter( 'should_load_separate_core_block_assets', array( $this, 'should_load_separate_core_block_assets' ) );
		add_filter( 'styles_inline_size_limit', array( $this, 'styles_inline_size_limit' ) );
	}

	/**
	 * Register blocks and their assets.
	 */
	public function register_blocks() {
		$this->register_custom_blocks();
	}

	/**
	 * Set up theme supports for blocks.
	 */
	public function blocks_theme_supports() {
		add_theme_support( 'wp-block-styles' ); // extra core blocks styles.

		remove_theme_support( 'core-block-patterns' ); // remove default wp patterns and use only custom ones.
		add_filter( 'should_load_remote_block_patterns', '__return_false' );
	}

	/**
	 * Register custom blocks categories
	 *
	 * @param array $categories
	 *
	 * @return array
	 */
	public function block_categories( $categories ) {
		$include = true;

		foreach ( $categories as $category ) {
			if ( $this->blocks_category === $category['slug'] ) {
				$include = false;
			}
		}

		if ( $include ) {
			// move our category to the top, because we can 😎.
			array_unshift(
				$categories,
				array(
					'slug'  => $this->blocks_category,
					'title' => __( 'Chisel Blocks', 'chisel' ),
					'icon'  => '<svg width="44" height="44" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44.16 44.16"><path d="M22.08,0a22,22,0,0,0-12,3.55.83.83,0,0,0-.25,1.16A.84.84,0,0,0,11,5,20.41,20.41,0,1,1,8.37,7,.84.84,0,1,0,7.23,5.74,22.08,22.08,0,1,0,22.08,0Zm15,12.07a.84.84,0,1,0-1.4.93,16.3,16.3,0,1,1-2.16-2.61.84.84,0,0,0,1.19,0,.85.85,0,0,0,0-1.19,18.14,18.14,0,1,0,2.38,2.88Zm-15-2.86a12.83,12.83,0,0,0-7.65,2.52.85.85,0,0,0-.17,1.18.84.84,0,0,0,1.18.18A11.18,11.18,0,1,1,24.8,32.93.84.84,0,0,0,25,34.59l.2,0A12.87,12.87,0,0,0,22.08,9.21ZM15,30.74A11.19,11.19,0,0,1,13,15.62a.84.84,0,1,0-1.37-1,12.86,12.86,0,0,0,2.36,17.4.84.84,0,0,0,.53.19.86.86,0,0,0,.66-.31A.85.85,0,0,0,15,30.74Z" fill="#2a1468"></path><path d="M28.49,25.69a.85.85,0,0,0-1.18.19,6.46,6.46,0,1,1-1.43-9,.84.84,0,1,0,1-1.36,8.15,8.15,0,1,0,1.8,11.38A.85.85,0,0,0,28.49,25.69Zm-6.41-7a3.43,3.43,0,1,0,3.43,3.43A3.44,3.44,0,0,0,22.08,18.65Zm0,5.17a1.74,1.74,0,1,1,1.74-1.74A1.74,1.74,0,0,1,22.08,23.82Z" fill="#ff6d54"></path></svg>',
				)
			);
		}

		return $categories;
	}

	/**
	 * Register block patterns categories
	 *
	 * @return void
	 */
	public function register_block_patterns_categories() {
		if ( ! $this->block_patterns_categories || ! function_exists( 'register_block_pattern_category' ) ) {
			return;
		}

		foreach ( $this->block_patterns_categories as $slug => $category ) {
			$category['label'] = '[Chisel] ' . $category['label'];
			register_block_pattern_category( 'chisel-patterns/' . $slug, $category );
		}
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
	 * Modify blocks content. Add custom classes to all blocks
	 *
	 * @param string $block_content
	 * @param array  $block
	 * @param object $block_instance WP_Block instance.
	 *
	 * @return string
	 */
	public function render_block( $block_content, $block, $block_instance ) {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return $block_content;
		}

		$custom_classnames = self::get_block_object_classnames( $block['blockName'] );

		if ( empty( $custom_classnames ) ) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor( $block_content );
		$processor->next_tag(); // Get first tag.
		$processor->add_class( $custom_classnames );
		$processor->remove_class( 'is-layout-flow' ); // It overwrites margin styles. Let's get rid of it.

		return $processor->get_updated_html();
	}

	/**
	 * Set inline size limit for the styles. Default wp limit is 20000.
	 *
	 * @param int $limit
	 *
	 * @return int
	 */
	public function styles_inline_size_limit( $limit ) {
		$limit = apply_filters( 'chisel_styles_inline_size_limit', 10000 );

		return $limit;
	}

	/**
	 * Should load separate core block assets or in bulk in one block-library css file.
	 *
	 * @param bool $load
	 *
	 * @return bool
	 */
	public function should_load_separate_core_block_assets( $load ) {
		$load = apply_filters( 'chisel_load_separate_core_block_assets', false );

		return $load;
	}

	/**
	 * Get block object classnames
	 *
	 * @param string $block_name
	 *
	 * @return string
	 */
	public static function get_block_object_classnames( $block_name ) {
		if ( ! $block_name ) {
			return '';
		}

		$block_name_parts = explode( '/', $block_name );

		if ( empty( $block_name_parts ) || ! isset( $block_name_parts[1] ) ) {
			return '';
		}

		return 'c-block c-block--' . $block_name_parts[0] . ' c-block--' . $block_name_parts[1];
	}

	/**
	 * Render twig file for a block
	 *
	 * @param string $block_name
	 * @param array  $context
	 *
	 * @return void
	 */
	public static function render_twig_file( $block_name, $context ) {
		$block_name = explode( '/', $block_name );
		$block_name = end( $block_name );

		$twig_file = self::get_instance()->blocks_twig_base_path . $block_name . '/render.twig';
		Timber::render( $twig_file, $context );
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
