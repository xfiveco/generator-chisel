<?php

namespace Chisel\WP;

use Timber\Post as TimberPost;
use Timber\Timber;
use Chisel\Helpers\ImageHelpers;

/**
 * Extend Timber Post class with custom functionality.
 *
 * @package Chisel
 */
class ChiselPost extends TimberPost {

	/**
	 * Post thumbnail.
	 *
	 * @var ?string
	 */
	public ?string $thumbnail_html = null;

	/**
	 * Get the post thumbnail. Returns the thumbnail responsive image html.
	 *
	 * @param string $size Thumbnail size.
	 *
	 * @return string Responsive <img> HTML, or empty string.
	 */
	public function get_thumbnail( string $size = 'medium' ): string {
		if ( $this->thumbnail_html === null ) {
			$this->thumbnail_html = '';

			if ( has_post_thumbnail( $this->ID ) ) {
				$thumbnail_id         = get_post_thumbnail_id( $this->ID );
				$this->thumbnail_html = ImageHelpers::get_responsive_image( $thumbnail_id, $size );
			}
		}

		return $this->thumbnail_html;
	}
}
