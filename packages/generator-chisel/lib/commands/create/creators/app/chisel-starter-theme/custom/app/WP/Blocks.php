<?php

namespace Chisel\WP\Custom;

use Chisel\Traits\HooksSingleton;

/**
 * Project-specific block and pattern customizations.
 *
 * @package Chisel
 */
class Blocks {

	use HooksSingleton;

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'chisel_block_patterns_categories', array( $this, 'block_patterns_categories' ) );
	}

	/**
	 * Add project-specific block pattern categories.
	 *
	 * Slugs are unprefixed; the 'chisel-patterns/' namespace is prepended by core.
	 * Reference a category in a pattern header as `chisel-patterns/{slug}`.
	 *
	 * @param array $categories Map of slug => array{ label: string, description: string }.
	 *
	 * @return array
	 */
	public function block_patterns_categories( array $categories ): array {
		$custom_categories = array();

		return array_merge( $categories, $custom_categories );
	}
}
