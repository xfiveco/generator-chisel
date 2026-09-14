<?php

namespace Chisel\Traits;

use Timber\Timber;
use Chisel\Helpers\BlocksHelpers;

trait PageBlocks {
	/**
	 * Get the block names used on the current page, filtered by prefix.
	 *
	 * The parsed content is cached on BlocksHelpers rather than on the trait,
	 * because trait statics are per-class: every class using this trait would
	 * otherwise parse the page content again.
	 *
	 * @param string $prefix
	 *
	 * @return array
	 */
	public function get_content_blocks_names( string $prefix = 'chisel' ): array {
		$cached = BlocksHelpers::get_page_blocks_names_by_prefix( $prefix );

		if ( $cached !== null ) {
			return $cached;
		}

		$page_blocks_names = BlocksHelpers::get_page_blocks_names();

		if ( $page_blocks_names === null ) {
			$page_blocks_names = $this->parse_page_blocks_names();

			BlocksHelpers::set_page_blocks_names( $page_blocks_names );
		}

		$content_blocks_names = array_filter(
			$page_blocks_names,
			function ( string $block_name ) use ( $prefix ): bool {
				return strpos( $block_name, $prefix ) !== false;
			}
		);

		if ( ! empty( $content_blocks_names ) ) {
			$content_blocks_names = array_values( array_unique( $content_blocks_names ) );
			$content_blocks_names = array_map(
				function ( string $block_name ) use ( $prefix ): string {
					return str_replace( $prefix . '/', '', $block_name );
				},
				$content_blocks_names
			);
		}

		BlocksHelpers::set_page_blocks_names_by_prefix( $prefix, $content_blocks_names );

		return $content_blocks_names;
	}

	/**
	 * Parse all block names out of the current page content. Prefix agnostic.
	 *
	 * @return array
	 */
	private function parse_page_blocks_names(): array {
		global $post;

		if ( ! $post instanceof \WP_Post ) {
			return array();
		}

		$content = $post->post_content . $this->get_sidebar_content();

		if ( empty( $content ) || ! has_blocks( $content ) ) {
			return array();
		}

		$blocks = parse_blocks( $content );

		if ( ! is_array( $blocks ) || empty( $blocks ) ) {
			return array();
		}

		return $this->get_blocks_names( $blocks );
	}

	/**
	 * Get blocks_names recursively.
	 *
	 * @param array $inner_blocks
	 *
	 * @return array
	 */
	private function get_blocks_names( array $inner_blocks ): array {
		$blocks_names = array();

		foreach ( $inner_blocks as $block ) {
			$block_name = sanitize_text_field( $block['blockName'] );

			if ( ! $block_name ) {
				continue;
			}

			$blocks_names[] = $block_name;

			if ( isset( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) ) {
				$inner_blocks_names = $this->get_blocks_names( $block['innerBlocks'] );

				if ( ! empty( $inner_blocks_names ) ) {
					$blocks_names = array_merge( $blocks_names, $inner_blocks_names );
				}
			}
		}

		return $blocks_names;
	}

	/**
	 * Get currently active sidebar content in order to parse its blocks.
	 *
	 * @return string
	 */
	private function get_sidebar_content(): string {
		$context = Timber::context();
		$sidebar = $context['sidebar'];
		$content = '';

		if ( $sidebar ) {
			$sidebars_widgets = get_option( 'sidebars_widgets', array() );

			if ( ! isset( $sidebars_widgets[ $sidebar['name'] ] ) ) {
				return '';
			}

			$sidebar_widgets = $sidebars_widgets[ $sidebar['name'] ];

			if ( empty( $sidebar_widgets ) ) {
				return '';
			}

			$sidebars_blocks = get_option( 'widget_block', array() );

			if ( empty( $sidebars_blocks ) ) {
				return '';
			}

			foreach ( $sidebar_widgets as $widget_id ) {
				$block_index = str_replace( 'block-', '', $widget_id );

				if ( isset( $sidebars_blocks[ $block_index ] ) ) {
					$content .= $sidebars_blocks[ $block_index ]['content'];
				}
			}
		}

		return $content;
	}
}
