<?php

namespace Chisel\WP;

use Timber\Term as TimberTerm;
use Chisel\Helper\ImageHelpers;

/**
 * Extend Timber Term class with custom functionality.
 *
 * @package Chisel
 */
class ChiselProductCategory extends TimberTerm {

	/**
	 * Category thumbnail.
	 *
	 * @var html
	 */
	public $thumbnail_html = null;

	/**
	 * Category thumbnail id.
	 *
	 * @var int
	 */
	public $thumbnail_id = null;

	/**
	 * Get the product thumbnail. Returns the thumbnail responsive image html.
	 *
	 * @param string $size Thumbnail size.
	 *
	 * @return html
	 */
	public function get_thumbnail( $size = 'woocommerce_thumbnail' ) {
		$size = apply_filters( 'subcategory_archive_thumbnail_size', $size );

		if ( $this->thumbnail_html === null ) {
			$thumbnail_id = $this->get_thumbnail_id( $size );

			$this->thumbnail_html = $thumbnail_id ? ImageHelpers::get_responsive_image( $thumbnail_id, $size ) : '';
		}

		return $this->thumbnail_html;
	}

	/**
	 * Get the product thumbnail id.
	 *
	 * @return int
	 */
	public function get_thumbnail_id() {
		if ( $this->thumbnail_id === null ) {
			$thumbnail_id = $this->meta( 'thumbnail_id' );

			if ( ! $thumbnail_id ) {
				$thumbnail_id = get_option( 'woocommerce_placeholder_image', 0 );
			}

			$this->thumbnail_id = $thumbnail_id;
		}

		return $this->thumbnail_id;
	}
}
