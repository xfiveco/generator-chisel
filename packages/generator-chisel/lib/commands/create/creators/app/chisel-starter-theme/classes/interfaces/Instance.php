<?php

namespace Chisel;

/**
 * Instance Interface
 *
 * @package Chisel
 */
interface Instance {

	/**
	 * Get the instance of the class.
	 */
	public static function get_instance();

	/**
	 * Set class properties.
	 */
	public function set_properties();

	/**
	 * Register action hooks.
	 */
	public function action_hooks();

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks();
}
