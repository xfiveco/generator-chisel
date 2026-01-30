<?php

namespace Chisel\WP\Custom;

use Chisel\Traits\HooksSingleton;

/**
 * Class for enqueuing scripts and styles.
 *
 * @package Chisel
 */
class Assets {
	use HooksSingleton;

	/**
	 * Add action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Add filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'chisel_frontend_styles', array( $this, 'frontend_styles' ) );
	}

	/**
	 * Modify frontend styles.
	 *
	 * @param array $styles Frontend styles.
	 *
	 * @return array Frontend styles.
	 */
	public function frontend_styles( array $styles ): array {
		return $styles;
	}
}
