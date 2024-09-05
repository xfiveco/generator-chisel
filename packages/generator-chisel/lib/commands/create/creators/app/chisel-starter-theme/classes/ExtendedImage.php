<?php

namespace Chisel;

use Timber\Image as TimberImage;

/**
 * Extend Timber Image class with custom functionality.
 *
 * @package Chisel
 */
class ExtendedImage extends TimberImage {

	/**
	 * Get responsive image html
	 *
	 * @param string $size Thumbnail size.
	 * @param array  $attrs Image attributes.
	 * @return html
	 */
	public function responsive( $size = 'medium', $attrs = array() ) {
		return wp_get_attachment_image( $this->ID, $size, false, $attrs );
	}
}
