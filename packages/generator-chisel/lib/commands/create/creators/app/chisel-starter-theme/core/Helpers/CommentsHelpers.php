<?php

namespace Chisel\Helpers;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class CommentsHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Display comments template - the comments and the form.
	 *
	 * @return string
	 */
	public static function comments_template(): string {
		if ( ! post_type_supports( get_post_type(), 'comments' ) ) {
			return '';
		}

		if ( comments_open() ) {
			return do_blocks( '<!-- wp:pattern {"slug":"chisel/comments"} /-->' );
		}

		return '';
	}
}
