<?php

namespace Chisel;

use Timber\Post as TimberPost;
use Timber\Timber;

/**
 * Extend Timber Post class with custom functionality. This is a woocommerce product class.
 *
 * @package Chisel
 */
class ExtendedProduct extends TimberPost {

	/**
	 * Product thumbnail.
	 *
	 * @var html
	 */
	public $thumbnail_html;

	/**
	 * Get the product thumbnail. Returns the thumbnail responsive image html.
	 *
	 * @param string $size Thumbnail size.
	 * @return html
	 */
	public function get_thumbnail( $size = 'woocommerce_thumbnail' ) {
		if ( ! $this->thumbnail_html ) {
			$thumbnail_html = has_post_thumbnail( $this->ID ) ? Helpers::get_responsive_image( get_post_thumbnail_id( $this->ID ), $size ) : '';

			if ( ! $thumbnail_html ) {
				$thumbnail_html = wc_placeholder_img( $size );
			}

			$this->thumbnail_html = $thumbnail_html;
		}

		return $this->thumbnail_html;
	}
}
