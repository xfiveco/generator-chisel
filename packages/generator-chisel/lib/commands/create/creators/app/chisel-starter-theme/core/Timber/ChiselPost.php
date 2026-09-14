<?php

namespace Chisel\Timber;

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
	 * Post thumbnail html, keyed by size and attributes.
	 *
	 * @var array
	 */
	public array $thumbnail_html = array();

	/**
	 * Get the post thumbnail. Returns the thumbnail responsive image html.
	 *
	 * @param string $size Thumbnail size.
	 * @param array  $attrs Image attributes.
	 *
	 * @return string Responsive <img> HTML, or empty string.
	 */
	public function get_thumbnail( string $size = 'medium', array $attrs = array() ): string {
		$cache_key = $size . '|' . md5( (string) wp_json_encode( $attrs ) );

		if ( ! isset( $this->thumbnail_html[ $cache_key ] ) ) {
			$html = '';

			if ( has_post_thumbnail( $this->ID ) ) {
				$thumbnail_id = get_post_thumbnail_id( $this->ID );
				$html         = ImageHelpers::get_responsive_image( $thumbnail_id, $size, $attrs );
			}

			$this->thumbnail_html[ $cache_key ] = $html;
		}

		return $this->thumbnail_html[ $cache_key ];
	}
}
