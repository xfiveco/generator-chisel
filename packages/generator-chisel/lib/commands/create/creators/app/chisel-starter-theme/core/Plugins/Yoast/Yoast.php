<?php

namespace Chisel\Plugins\Yoast;

use Chisel\Traits\HooksSingleton;
use Chisel\Helpers\YoastHelpers;

/**
 * Yoast SEO plugin related functionalities.
 *
 * @package Chisel
 */
final class Yoast {

	use HooksSingleton;

	/**
	 * Initialize.
	 */
	public function init(): bool {
		if ( ! YoastHelpers::is_yoast_active() ) {
			return false;
		}

		return true;
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {}
}
