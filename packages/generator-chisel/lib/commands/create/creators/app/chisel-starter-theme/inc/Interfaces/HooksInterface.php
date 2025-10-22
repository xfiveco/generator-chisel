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
	public function set_properties(): void;

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void;

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void;
}
