<?php

namespace Chisel\Helpers;

use Timber\Timber;
use Chisel\WP\AcfBlocks;
use Chisel\WP\Blocks;
use Chisel\Helpers\CacheHelpers;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class BlocksHelpers {
	/**
	 * All block names parsed from the current page content.
	 *
	 * Shared by every class using the PageBlocks trait.
	 *
	 * @var ?array
	 */
	private static ?array $page_blocks_names = null;

	/**
	 * Page block names already filtered per prefix, keyed by prefix.
	 *
	 * @var array
	 */
	private static array $page_blocks_names_by_prefix = array();

	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Get the cached block names of the current page content. Null when not parsed yet.
	 *
	 * @return ?array
	 */
	public static function get_page_blocks_names(): ?array {
		return self::$page_blocks_names;
	}

	/**
	 * Cache the block names parsed from the current page content.
	 *
	 * @param array $blocks_names
	 *
	 * @return void
	 */
	public static function set_page_blocks_names( array $blocks_names ): void {
		self::$page_blocks_names = $blocks_names;
	}

	/**
	 * Get the cached page block names for a prefix. Null when not cached yet.
	 *
	 * @param string $prefix
	 *
	 * @return ?array
	 */
	public static function get_page_blocks_names_by_prefix( string $prefix ): ?array {
		return self::$page_blocks_names_by_prefix[ $prefix ] ?? null;
	}

	/**
	 * Cache the page block names for a prefix.
	 *
	 * @param string $prefix
	 * @param array  $blocks_names
	 *
	 * @return void
	 */
	public static function set_page_blocks_names_by_prefix( string $prefix, array $blocks_names ): void {
		self::$page_blocks_names_by_prefix[ $prefix ] = $blocks_names;
	}

	/**
	 * Clear the cached page block names.
	 *
	 * @return void
	 */
	public static function clear_page_blocks_names(): void {
		self::$page_blocks_names           = null;
		self::$page_blocks_names_by_prefix = array();
	}

	/**
	 * Get block object classnames
	 *
	 * @param ?string $block_name
	 *
	 * @return string
	 */
	public static function get_block_object_classnames( ?string $block_name ): string {
		if ( empty( $block_name ) ) {
			return '';
		}

		$parts = explode( '/', $block_name );

		if ( count( $parts ) < 2 ) {
			return '';
		}

		return 'c-block c-block--' . $parts[0] . ' c-block--' . $parts[1];
	}

	/**
	 * Render twig file for a block
	 *
	 * @param string $block_name
	 * @param array  $context
	 *
	 * @return void
	 */
	public static function render_twig_file( string $block_name, array $context ): void {
		$parts      = explode( '/', $block_name );
		$block_name = end( $parts ) ?: $block_name;

		$twig_file = Blocks::get_instance()->blocks_twig_base_path . $block_name . '/render.twig';
		Timber::render( $twig_file, $context );
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
	public static function acf_block_render( array $block, string $content = '', bool $is_preview = false, int $post_id = 0 ): void {
		if ( empty( $block['name'] ) ) {
			return;
		}

		$context = Timber::context();

		$block_slug = str_replace( 'chisel/', '', $block['name'] );

		$slug                  = 'b-' . $block_slug;
		$context['block']      = $block;
		$context['post_id']    = $post_id;
		$context['slug']       = $slug;
		$context['is_preview'] = $is_preview;
		$context['fields']     = function_exists( 'get_fields' ) ? get_fields( $block['id'] ) : array();
		$classes               = array_merge(
			array( $slug ),
			isset( $block['className'] ) ? array( $block['className'] ) : array(),
			$is_preview ? array( 'is-preview' ) : array(),
			$block['supports']['align'] ? array( 'align' . $context['block']['align'] ) : array(),
		);

		$context['block']['class_names'] = $classes;
		$context['block']['block_id']    = $block['anchor'] ?? ( $block['id'] ?? '' );

		// Allow to use filters to manipulate the output.
		$context = apply_filters( 'chisel_timber_acf_blocks_data', $context );
		$context = apply_filters( 'chisel_timber_acf_blocks_data_' . $block_slug, $context );
		$context = apply_filters( 'chisel_timber_acf_blocks_data_' . $block['id'], $context );

		// Check if WP_Block_Supports has a block to render to avoid warnings.
		if ( class_exists( '\WP_Block_Supports' ) && \WP_Block_Supports::$block_to_render ) {
			$context['wrapper_attributes'] = get_block_wrapper_attributes(
				array(
					'id'    => $context['block']['block_id'],
					'class' => implode( ' ', $context['block']['class_names'] ),
				)
			);
		} else {
			// Fallback: manually construct attributes if block context is missing.
			$context['wrapper_attributes'] = sprintf(
				'id="%s" class="%s"',
				esc_attr( $context['block']['block_id'] ),
				esc_attr( implode( ' ', $context['block']['class_names'] ) )
			);
		}

		Timber::render( AcfBlocks::get_instance()->blocks_twig_base_path . $block_slug . '/' . $block_slug . '.twig', $context, CacheHelpers::expiry() );
	}

	/**
	 * Get block inline css from disk. The block style.scss is built into the entry css file
	 * (`style-index.css` for WP blocks, `style-script.css` for ACF blocks).
	 *
	 * @param string $blocks_path Absolute filesystem path to the blocks build directory.
	 * @param string $block_name
	 * @param string $file_name   Built css file name for the block.
	 *
	 * @return string
	 */
	public static function get_block_inline_css( string $blocks_path, string $block_name, string $file_name = 'style-index.css' ): string {
		static $cache = array();

		$css_file = rtrim( $blocks_path, '/' ) . '/' . $block_name . '/' . $file_name;

		if ( isset( $cache[ $css_file ] ) ) {
			return $cache[ $css_file ];
		}

		$css = is_file( $css_file ) ? (string) file_get_contents( $css_file ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		$cache[ $css_file ] = $css;

		return $css;
	}
}
