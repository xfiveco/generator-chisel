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
			$this->thumbnail_html = has_post_thumbnail( $this->ID ) ? Timber::get_image( get_post_thumbnail_id( $this->ID ) )->responsive( $size ) : '';
		}

		return $this->thumbnail_html;
	}

	/**
	 * Get the post dynamic title based on acf field selection.
	 *
	 * @return html
	 */
	public function get_title() {
		if ( $this->dynamic_title === null ) {
			$display = get_field( 'page_title_display', $this->ID ) ?: 'show';

			if ( $display === 'hide' ) {
				$this->dynamic_title = '';
			} else {
				$sr_only = $display === 'hide-visually' ? 'u-sr-only' : '';

				$this->dynamic_title = sprintf( '<h1 class="c-title %s">%s</h1>', $sr_only, $this->post_title );
			}
		}

		return $this->dynamic_title;
	}
}
