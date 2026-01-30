<?php

namespace Chisel\Traits;

trait Singleton {
	/**
	 * Instances of classes using this trait, keyed by class name.
	 *
	 * @var array<string, static>
	 */
	private static array $instances = array();

	/**
	 * Get the instance of the class using the singleton.
	 *
	 * @return static
	 */
	public static function get_instance(): static {
		$class = static::class;

		if ( ! isset( self::$instances[ $class ] ) ) {
			self::$instances[ $class ] = new static();
		}

		return self::$instances[ $class ];
	}

	/**
	 * Prevent direct construction; let get_instance() control instantiation.
	 */
	protected function __construct() {}

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
