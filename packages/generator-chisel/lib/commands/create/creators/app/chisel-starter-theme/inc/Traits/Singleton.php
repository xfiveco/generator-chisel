<?php

namespace Chisel\Traits;

trait Singleton {
	/**
	 * Instance of the class.
	 *
	 * @var self
	 */
	private static $instance;

	/**
	 * Get the instance of the class.
	 */
	public static function get_instance() {
		if ( ! ( self::$instance instanceof self ) ) {
				self::$instance = new self();
		}

		return self::$instance;
	}
}
