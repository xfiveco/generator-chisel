<?php

namespace Chisel\Timber;

use Timber\Image as TimberImage;

/**
 * Extend Timber Image class with custom functionality.
 *
 * @package Chisel
 */
class ChiselImage extends TimberImage {

	/**
	 * Get responsive image html
	 *
	 * @param string $size Thumbnail size.
	 * @param array  $attrs Image attributes.
	 *
	 * @return string The responsive <img> HTML.
	 */
	public function responsive( string $size = 'medium', array $attrs = array() ): string {
		if ( isset( $attrs['class'] ) ) {
			$attrs['class'] .= sprintf( ' wp-image-%s size-%s', absint( $this->ID ), esc_attr( $size ) );
		}

		return wp_get_attachment_image( $this->ID, $size, false, $attrs );
	}
}
