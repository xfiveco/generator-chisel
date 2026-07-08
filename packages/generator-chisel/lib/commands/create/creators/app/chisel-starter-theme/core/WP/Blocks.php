<?php

namespace Chisel\WP;

use Timber\Timber;

use Chisel\Traits\HooksSingleton;
use Chisel\Factories\RegisterBlocks;
use Chisel\Helpers\BlocksHelpers;
use Chisel\Helpers\ThemeHelpers;
use Chisel\Traits\PageBlocks;

/**
 * Blocks related functionalities.
 *
 * @package Chisel
 */
final class Blocks {

	use HooksSingleton;
	use PageBlocks;

	/**
	 * Register blocks factory.
	 *
	 * @var RegisterBlocks
	 */
	private RegisterBlocks $register_blocks_factory;

	/**
	 * Theme.
	 *
	 * @var \WP_Theme
	 */
	private ?\WP_Theme $theme = null;

	/**
	 * Blocks.
	 *
	 * @var array
	 */
	private array $blocks = array();

	/**
	 * Chisel blocks category.
	 *
	 * @var string
	 */
	private string $blocks_category = '';

	/**
	 * Block patterns.
	 *
	 * @var array
	 */
	private array $block_patterns = array();


	/**
	 * Blocks patterns categories.
	 *
	 * @var array
	 */
	private array $block_patterns_categories = array();


	/**
	 * Blocks patterns categories namespace.
	 *
	 * @var string
	 */
	private string $block_patterns_categories_namespace = '';

	/**
	 * Block patterns path.
	 *
	 * @var string
	 */
	private string $block_patterns_path = '';

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
		$this->register_blocks_factory             = new RegisterBlocks( 'wp' );
		$this->blocks                              = $this->register_blocks_factory->get_blocks();
		$this->blocks_twig_base_path               = 'build/blocks/';
		$this->theme                               = wp_get_theme();
		$this->blocks_category                     = 'chisel-blocks';
		$this->block_patterns_path                 = get_template_directory() . '/patterns/';
		$this->block_patterns_categories_namespace = 'chisel-patterns';
		$this->block_patterns_categories           = array(
			'hero'         => array(
				'label'       => __( 'Hero', 'chisel' ),
				'description' => __( 'Hero Sections.', 'chisel' ),
			),
			'features'     => array(
				'label'       => __( 'Features', 'chisel' ),
				'description' => __( 'Features Sections.', 'chisel' ),
			),
			'cta'          => array(
				'label'       => __( 'Call to Action', 'chisel' ),
				'description' => __( 'Call to Action Sections.', 'chisel' ),
			),
			'testimonials' => array(
				'label'       => __( 'Testimonials', 'chisel' ),
				'description' => __( 'Testimonials Sections.', 'chisel' ),
			),
			'team'         => array(
				'label'       => __( 'Team', 'chisel' ),
				'description' => __( 'Team Sections.', 'chisel' ),
			),
			'pricing'      => array(
				'label'       => __( 'Pricing', 'chisel' ),
				'description' => __( 'Pricing Sections.', 'chisel' ),
			),
			'text'         => array(
				'label'       => __( 'Text', 'chisel' ),
				'description' => __( 'Text Sections.', 'chisel' ),
			),
			'gallery'      => array(
				'label'       => __( 'Gallery', 'chisel' ),
				'description' => __( 'Gallery Sections.', 'chisel' ),
			),
			'faq'          => array(
				'label'       => __( 'FAQ', 'chisel' ),
				'description' => __( 'FAQ Sections.', 'chisel' ),
			),
			'stats'        => array(
				'label'       => __( 'Stats', 'chisel' ),
				'description' => __( 'Statistics Sections.', 'chisel' ),
			),
			'logos'        => array(
				'label'       => __( 'Logos', 'chisel' ),
				'description' => __( 'Logo Cloud Sections.', 'chisel' ),
			),
		);
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'after_setup_theme', array( $this, 'blocks_theme_supports' ) );
		add_action( 'init', array( $this, 'register_block_patterns_categories' ) );
		add_action( 'wp_print_styles', array( $this, 'dequeue_blocks_styles' ), 999 );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'block_categories_all', array( $this, 'block_categories' ) );
		add_filter( 'timber/locations', array( $this, 'tiwg_files_locations' ) );
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 3 );
		add_filter( 'register_block_type_args', array( $this, 'register_block_type_args' ), 10, 2 );

		add_filter( 'should_load_separate_core_block_assets', array( $this, 'should_load_separate_core_block_assets' ) );
		add_filter( 'styles_inline_size_limit', array( $this, 'styles_inline_size_limit' ) );
		add_filter( 'chisel_editor_scripts', array( $this, 'blocks_alignment_data' ) );
		add_filter( 'block_editor_settings_all', array( $this, 'block_editor_settings' ) );
	}

	/**
	 * Register blocks and their assets.
	 */
	public function register_blocks(): void {
		$this->register_blocks_factory->register_custom_blocks();
	}

	/**
	 * Set up theme supports for blocks.
	 */
	public function blocks_theme_supports(): void {
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
	public function block_categories( array $categories ): array {
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
					'title' => sprintf( '%s %s', ThemeHelpers::get_theme_name(), esc_html__( 'Blocks', 'chisel' ) ),
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
	public function register_block_patterns_categories(): void {
		$this->block_patterns_categories = apply_filters( 'chisel_block_patterns_categories', $this->block_patterns_categories );

		if ( ! $this->block_patterns_categories || ! function_exists( 'register_block_pattern_category' ) ) {
			return;
		}

		$this->maybe_clear_patterns_cache();

		foreach ( $this->block_patterns_categories as $slug => $category ) {
			$category['label'] = sprintf( '[%s] %s', ThemeHelpers::get_theme_name(), esc_attr( $category['label'] ) );
			register_block_pattern_category( $this->block_patterns_categories_namespace . '/' . $slug, $category );
		}
	}

	/**
	 * Add custom Twig files locations.
	 *
	 * @param array $locations The locations.
	 * @return array
	 */
	public function tiwg_files_locations( array $locations ): array {
		if ( ! is_array( $this->blocks ) || ! $this->blocks ) {
			return $locations;
		}

		foreach ( $this->blocks as $block ) {
			$locations[] = array( $this->register_blocks_factory->get_blocks_path_src() . '/' . $block . '/' );
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
	public function render_block( string $block_content, array $block, object $block_instance ): string {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() ) {
			return $block_content;
		}

		$custom_classnames = BlocksHelpers::get_block_object_classnames( $block['blockName'] );

		if ( empty( $custom_classnames ) ) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor( $block_content );

		if ( $processor->next_tag() ) {
			$classes_to_remove = array( 'is-layout-flow', 'is-layout-constrained' );

			$processor->add_class( $custom_classnames );

			foreach ( $classes_to_remove as $class ) {
				$processor->remove_class( $class );
			}

			if ( $block['blockName'] === 'core/table' ) {
				$processor->add_class( 'u-table-responsive' );
			}

			$block_content = $processor->get_updated_html();
		}

		return $block_content;
	}

	/**
	 * Extend server-registered block attributes with editor-added custom attributes.
	 *
	 * This keeps REST block renderer validation in sync with JS filters that add
	 * custom attributes (e.g. disableBottomMargin in editor mods).
	 *
	 * @param array  $args       Block type args.
	 * @param string $block_name Registered block name.
	 *
	 * @return array
	 */
	public function register_block_type_args( array $args, string $block_name ): array {
		if ( strpos( $block_name, 'core/' ) !== 0 && strpos( $block_name, 'chisel/' ) !== 0 ) {
			return $args;
		}

		if ( ! isset( $args['attributes'] ) || ! is_array( $args['attributes'] ) ) {
			$args['attributes'] = array();
		}

		if ( ! isset( $args['attributes']['disableBottomMargin'] ) ) {
			$args['attributes']['disableBottomMargin'] = array(
				'type'    => 'boolean',
				'default' => false,
			);
		}

		return $args;
	}

	/**
	 * Set inline size limit for the styles. Default wp limit is 20000.
	 *
	 * @param int $limit
	 *
	 * @return int
	 */
	public function styles_inline_size_limit( int $limit ): int {
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
	public function should_load_separate_core_block_assets( bool $load ): bool {
		$load = apply_filters( 'chisel_load_separate_core_block_assets', false );

		return $load;
	}

	/**
	 * Set default alignment for blocks.
	 *
	 * @param array $editor_scripts_data
	 *
	 * @return array
	 */
	public function blocks_alignment_data( array $editor_scripts_data ): array {
		$editor_scripts_data['editor']['localize']['data']['blocksDefaultAlignment'] = array(
			'chisel/slider' => 'full',
		);

		return $editor_scripts_data;
	}

	/**
	 * Modify block editor settings.
	 *
	 * WP 7.0 treats blocks carrying metadata.patternName as content-only
	 * "sections" requiring the Edit pattern step; opt out to keep unsynced
	 * patterns directly editable.
	 *
	 * @param array $settings Editor settings.
	 *
	 * @return array
	 */
	public function block_editor_settings( array $settings ): array {
		$settings['disableContentOnlyForUnsyncedPatterns'] = true;

		return $settings;
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
					wp_dequeue_style( 'block-wp-' . $block_name . '-style' );
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

	/**
	 * Get block patterns from the patterns directory.
	 *
	 * @return array
	 */
	protected function get_block_patterns(): array {
		if ( $this->block_patterns ) {
			return $this->block_patterns;
		}

		$patterns_list = is_dir( $this->block_patterns_path ) ? new \DirectoryIterator( $this->block_patterns_path ) : array();

		if ( $patterns_list ) {
			foreach ( $patterns_list as $item ) {
				if ( $item->isDot() || $item->isDir() || 'php' !== $item->getExtension() ) {
					continue;
				}

				$block_name = $item->getFilename();

				if ( ! in_array( $block_name, $this->block_patterns, true ) ) {
					$this->block_patterns[] = $block_name;
				}
			}
		}

		return $this->block_patterns;
	}

	/**
	 * Maybe clear patterns cache. Clear patterns cache if block patterns categories are changed / added.
	 *
	 * @return void
	 */
	protected function maybe_clear_patterns_cache() {
		if ( ! $this->block_patterns_categories ) {
			return;
		}

		$theme_patterns           = $this->get_block_patterns();
		$theme_pattern_categories = $this->block_patterns_categories;
		$cached_patterns          = $this->theme->get_block_patterns();
		$patterns_categories      = array();

		foreach ( $cached_patterns as $pattern ) {
			$slug = $pattern['slug'] ?? '';
			$file = '';

			if ( $slug ) {
				$file = explode( '/', $slug );
				$file = end( $file ) . '.php';
			}

			if ( $file && in_array( $file, $theme_patterns, true ) ) {
				$key = array_search( $file, $theme_patterns, true );

				unset( $theme_patterns[ $key ] );
			}

			foreach ( $pattern['categories'] ?? array() as $category ) {
				$category = str_replace( $this->block_patterns_categories_namespace . '/', '', $category );

				if ( isset( $theme_pattern_categories[ $category ] ) ) {
					unset( $theme_pattern_categories[ $category ] );
				}
			}
		}

		if ( ! empty( $theme_pattern_categories ) || ! empty( $theme_patterns ) ) {
			$this->theme->delete_pattern_cache();
		}
	}
}
