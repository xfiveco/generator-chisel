<?php

namespace Chisel\Helpers;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class SearchHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Default post types included in search queries.
	 *
	 * @var array
	 */
	private static array $post_types = array(
		'post',
		'page',
	);

	/**
	 * Get post types that should be included in search queries.
	 *
	 * @return array
	 */
	public static function get_searchable_post_types(): array {
		return apply_filters( 'chisel_searchable_post_types', self::$post_types );
	}
}
