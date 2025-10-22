<?php

namespace Chisel\Traits;

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

		if ( $post instanceof \WP_Post && ! empty( $post->post_content ) && has_blocks( $post->post_content ) ) {
			$blocks = parse_blocks( $post->post_content );

			if ( is_array( $blocks ) && ! empty( $blocks ) ) {
				$blocks_names = $this->get_blocks_names( $blocks );

				if ( ! empty( $blocks_names ) ) {
					$blocks_names = array_filter(
						$blocks_names,
						function ( string $block_name ) use ( $prefix ): bool {
							return (bool) strpos( $block_name, $prefix ) !== false;
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
}
