<?php

namespace Chisel\Interfaces;

/**
 * Hooks Interface
 *
 * @package Chisel
 */
interface HooksInterface {

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
