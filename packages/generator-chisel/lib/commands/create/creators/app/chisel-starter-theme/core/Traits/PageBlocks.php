<?php

namespace Chisel\Traits;

use Timber\Timber;

trait PageBlocks {
	/**
	 * Content blocks from current page
	 *
	 * @var ?array
	 */
	private static ?array $content_blocks_names = null;

	/**
	 * Get the instance of the class.
	 *
	 * @param string $prefix
	 *
	 * @return array
	 */
	public function get_content_blocks_names( string $prefix = 'chisel' ): array {
		if ( self::$content_blocks_names !== null ) {
			return self::$content_blocks_names;
		}

		global $post;

		$content_blocks_names = array();

		if ( $post instanceof \WP_Post ) {
			$content = $post->post_content . $this->get_sidebar_content();

			if ( empty( $content ) ) {
				return $content_blocks_names;
			}

			if ( ! has_blocks( $content ) ) {
				return $content_blocks_names;
			}

			$blocks = parse_blocks( $content );

			if ( is_array( $blocks ) && ! empty( $blocks ) ) {
				$blocks_names = $this->get_blocks_names( $blocks );

				if ( ! empty( $blocks_names ) ) {
					$blocks_names = array_filter(
						$blocks_names,
						function ( string $block_name ) use ( $prefix ): bool {
							return strpos( $block_name, $prefix ) !== false;
						}
					);

					if ( ! empty( $blocks_names ) ) {
						$blocks_names         = array_values( array_unique( $blocks_names ) );
						$blocks_names         = array_map(
							function ( string $block_name ) use ( $prefix ): string {
								return str_replace( $prefix . '/', '', $block_name );
							},
							$blocks_names
						);
						$content_blocks_names = array_merge( $content_blocks_names, $blocks_names );
					}
				}
			}
		}

		self::$content_blocks_names = $content_blocks_names;

		return self::$content_blocks_names;
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
