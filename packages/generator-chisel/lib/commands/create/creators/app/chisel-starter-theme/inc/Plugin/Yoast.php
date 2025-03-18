<?php

namespace Chisel\Plugin;

use Chisel\Interfaces\InstanceInterface;
use Chisel\Interfaces\HooksInterface;
use Chisel\Traits\Singleton;
use Chisel\Helper\YoastHelpers;

/**
 * Yoast SEO plugin related functionalities.
 *
 * @package Chisel
 */
class Yoast implements InstanceInterface, HooksInterface {

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
	public function set_properties() {}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {}
}
