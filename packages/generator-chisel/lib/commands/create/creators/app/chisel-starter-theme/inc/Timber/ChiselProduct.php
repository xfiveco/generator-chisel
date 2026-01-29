<?php

namespace Chisel\Timber;

use Timber\Post as TimberPost;
use Timber\Timber;
use Chisel\Helpers\ImageHelpers;

/**
 * Extend Timber Post class with custom functionality. This is a woocommerce product class.
 *
 * @package Chisel
 */
class ChiselProduct extends TimberPost {

	/**
	 * Product thumbnail.
	 *
	 * @var ?string
	 */
	public ?string $thumbnail_html = null;

	/**
	 * Category thumbnail id.
	 *
	 * @var ?int
	 */
	public ?int $thumbnail_id = null;

	/**
	 * Get the product thumbnail. Returns the thumbnail responsive image html.
	 *
	 * @param string $size Thumbnail size.
	 * @param array  $attrs Image attributes.
	 *
	 * @return string Responsive <img> HTML, or empty string.
	 */
	public function get_thumbnail( string $size = 'woocommerce_thumbnail', array $attrs = array() ): string {
		$size = apply_filters( 'single_product_archive_thumbnail_size', $size );

		if ( $this->thumbnail_html === null ) {
			$thumbnail_id = $this->get_thumbnail_id();

			$this->thumbnail_html = $thumbnail_id ? ImageHelpers::get_responsive_image( $thumbnail_id, $size, $attrs ) : '';
		}

		return $this->thumbnail_html;
	}

	/**
	 * Get the product thumbnail id
	 *
	 * @return int
	 */
	public function get_thumbnail_id(): int {
		if ( $this->thumbnail_id === null ) {
			$thumbnail_id = get_post_thumbnail_id( $this->ID );

			if ( ! $thumbnail_id ) {
				$thumbnail_id = get_option( 'woocommerce_placeholder_image', 0 );
			}

			$this->thumbnail_id = $thumbnail_id;
		}

		return (int) $this->thumbnail_id;
	}
}
