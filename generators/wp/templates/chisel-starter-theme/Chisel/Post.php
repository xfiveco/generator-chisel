<?php

namespace Chisel;

/**
 * Class Post
 * @package Chisel
 *
 * Use this class to extend \Timber\Post features
 */
class Post extends \Timber\Post {
	/**
	 * Returns Post class name. You can also return an array('post_type' => 'post_type_class_name')
	 *  to use different classes for individual post types.
	 *
	 * @param $post_class
	 *
	 * @return string|array
	 */
	public function overrideTimberPostClass( $post_class ) {
		return '\Chisel\Post';
	}
}
