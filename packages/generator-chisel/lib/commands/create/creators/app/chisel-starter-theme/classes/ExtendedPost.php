<?php

namespace Chisel;

use Timber\Post as TimberPost;
use Timber\Timber;

/**
 * Extend Timber Post class with custom functionality.
 *
 * @package Chisel
 */
class ExtendedPost extends TimberPost {

	/**
	 * Post thumbnail.
	 *
	 * @var html
	 */
	public $thumbnail_html;

	/**
	 * Post title.
	 *
	 * @var string
	 */
	public $dynamic_title = null;

	/**
	 * Get the post thumbnail. Returns the thumbnail responsive image html.
	 *
	 * @param string $size Thumbnail size.
	 * @return html
	 */
	public function get_thumbnail( $size = 'medium' ) {
		if ( ! $this->thumbnail_html ) {
			$this->thumbnail_html = has_post_thumbnail( $this->ID ) ? Helpers::get_responsive_image( get_post_thumbnail_id( $this->ID ), $size ) : '';
		}

		return $this->thumbnail_html;
	}
}
