<?php

namespace Chisel\Helper;

/**
 * Helper functions.
 *
 * @package Chisel
 */
class CommentsHelpers {

	/**
	 * Display comments template - the comments and the form.
	 *
	 * @return void
	 */
	public static function comments_template() {
		if ( ! post_type_supports( get_post_type(), 'comments' ) ) {
			return;
		}

		if ( comments_open() ) {
			return apply_filters( 'the_content', '<!-- wp:pattern {"slug":"chisel/comments"} /-->' );
		}
	}
}
