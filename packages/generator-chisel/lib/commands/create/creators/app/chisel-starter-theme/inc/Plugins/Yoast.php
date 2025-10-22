<?php

namespace Chisel\Plugins;

use Chisel\Interfaces\InstanceInterface;
use Chisel\Interfaces\HooksInterface;
use Chisel\Traits\Singleton;
use Chisel\Helpers\YoastHelpers;

/**
 * Yoast SEO plugin related functionalities.
 *
 * @package Chisel
 */
final class Yoast implements InstanceInterface, HooksInterface {

	use Singleton;

	/**
	 * Class constructor.
	 */
	private function __construct() {
		if ( ! YoastHelpers::is_yoast_active() ) {
			return;
		}

		$this->set_properties();
		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties(): void {}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {}
}
