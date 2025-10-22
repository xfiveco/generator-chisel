<?php

namespace Chisel\Traits;

trait Singleton {
	/**
	 * Instance of the class.
	 *
	 * @var object
	 */
	private static ?object $instance = null;

	/**
	 * Get the instance of the class using the singleton.
	 *
	 * @return object
	 */
	public static function get_instance(): static {
		if ( ! ( static::$instance instanceof static ) ) {
			static::$instance = new static();
		}

		return static::$instance;
	}

	/**
	 * Prevent direct construction; let get_instance() control instantiation.
	 */
	private function __construct() {}

	/**
	 * Prevent cloning.
	 */
	private function __clone() {}

	/**
	 * Prevent unserialization.
	 *
	 * @throws \LogicException - Cannot unserialize singleton.
	 */
	public function __wakeup(): void {
		throw new \LogicException( 'Cannot unserialize singleton' );
	}
}
