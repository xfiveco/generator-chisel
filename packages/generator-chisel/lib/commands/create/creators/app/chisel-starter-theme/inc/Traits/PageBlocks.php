<?php

namespace Chisel\Traits;

trait PageBlocks {
	/**
	 * Content blocks from current page
	 *
	 * @var array|null
	 */
	private static $content_blocks_names = null;

	/**
	 * Get the instance of the class.
	 *
	 * @param string $prefix
	 *
	 * @return array
	 */
	public function get_content_blocks_names( $prefix = 'chisel' ) {
		if ( self::$content_blocks_names ) {
			return self::$content_blocks_names;
		}

		global $post;

		$content_blocks_names = array();

		if ( is_a( $post, 'WP_Post' ) && $post->post_content && has_blocks( $post->post_content ) ) {
			$blocks = parse_blocks( $post->post_content );

			if ( $blocks ) {
				$blocks_names = $this->get_blocks_names( $blocks );

				if ( $blocks_names ) {
					$blocks_names = array_filter(
						$blocks_names,
						function ( $block_name ) use ( $prefix ) {
							return strpos( $block_name, $prefix ) !== false;
						}
					);

					if ( $blocks_names ) {
						$blocks_names         = array_values( array_unique( $blocks_names ) );
						$blocks_names         = array_map(
							function ( $block_name ) use ( $prefix ) {
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
	private function get_blocks_names( $inner_blocks ) {
		$blocks_names = array();

		foreach ( $inner_blocks as $block ) {
			$block_name = sanitize_text_field( $block['blockName'] );

			if ( ! $block_name ) {
				continue;
			}

			$blocks_names[] = $block_name;

			if ( isset( $block['innerBlocks'] ) && $block['innerBlocks'] ) {
				$inner_blocks_names = $this->get_blocks_names( $block['innerBlocks'] );

				if ( $inner_blocks_names ) {
					$blocks_names = array_merge( $blocks_names, $inner_blocks_names );
				}
			}
		}

		return $blocks_names;
	}
}
