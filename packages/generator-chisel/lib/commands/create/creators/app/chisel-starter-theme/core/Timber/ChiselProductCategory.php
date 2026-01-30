<?php

namespace Chisel\Timber;

use Timber\Term as TimberTerm;
use Chisel\Helpers\ImageHelpers;

/**
 * Extend Timber Term class with custom functionality.
 *
 * @package Chisel
 */
class ChiselProductCategory extends TimberTerm {

	/**
	 * Category thumbnail.
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
		$size = apply_filters( 'subcategory_archive_thumbnail_size', $size );

		if ( $this->thumbnail_html === null ) {
			$thumbnail_id = $this->get_thumbnail_id();

			$this->thumbnail_html = $thumbnail_id ? ImageHelpers::get_responsive_image( $thumbnail_id, $size, $attrs ) : '';
		}

		return $this->thumbnail_html;
	}

	/**
	 * Get the product thumbnail id.
	 *
	 * @return int
	 */
	public function get_thumbnail_id(): int {
		if ( $this->thumbnail_id === null ) {
			$thumbnail_id = (int) $this->meta( 'thumbnail_id' );

			if ( ! $thumbnail_id ) {
				$thumbnail_id = get_option( 'woocommerce_placeholder_image', 0 );
			}

			$this->thumbnail_id = $thumbnail_id;
		}

		return $this->thumbnail_id;
	}
}
