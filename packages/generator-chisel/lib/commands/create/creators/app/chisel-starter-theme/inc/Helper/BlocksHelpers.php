<?php

namespace Chisel\Helper;

use Timber\Timber;
use Chisel\WP\AcfBlocks;
use Chisel\Helper\CacheHelpers;

/**
 * Helper functions.
 *
 * @package Chisel
 */
class BlocksHelpers {

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
}
