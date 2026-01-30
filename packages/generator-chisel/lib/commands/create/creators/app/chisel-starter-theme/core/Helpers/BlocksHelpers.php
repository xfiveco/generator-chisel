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
	 * Prevent instantiation.
	 */
	private function __construct() {}

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

		// allow to use filters to manipulate the output.
		$context = apply_filters( 'chisel_timber_acf_blocks_data', $context );
		$context = apply_filters( 'chisel_timber_acf_blocks_data_' . $block_slug, $context );
		$context = apply_filters( 'chisel_timber_acf_blocks_data_' . $block['id'], $context );

		$context['wrapper_attributes'] = get_block_wrapper_attributes(
			array(
				'id'    => $context['block']['block_id'],
				'class' => implode( ' ', $context['block']['class_names'] ),
			)
		);

		Timber::render( AcfBlocks::get_instance()->blocks_twig_base_path . $block_slug . '/' . $block_slug . '.twig', $context, CacheHelpers::expiry() );
	}

	/**
	 * Get block inline css from url. The critical.scss imported into script.js will be built into script.css.
	 *
	 * @param string $blocks_url
	 * @param string $block_name
	 *
	 * @return string
	 */
	public static function get_block_inline_css( string $blocks_url, string $block_name ): string {
		$css_url  = rtrim( $blocks_url, '/' ) . '/' . $block_name . '/script.css';
		$response = wp_remote_get( $css_url );
		$css      = '';

		if ( is_array( $response ) && ! is_wp_error( $response ) ) {
			$css = wp_remote_retrieve_body( $response );
		}

		return $css;
	}
}
