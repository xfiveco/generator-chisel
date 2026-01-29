<?php

namespace Chisel\Traits;

trait Hooks {
	/**
	 * Register action hooks.
	 */
	abstract public function action_hooks(): void;

	/**
	 * Register filter hooks.
	 */
	abstract public function filter_hooks(): void;

	/**
	 * Boot hooks.
	 */
	public function boot(): void {
		if ( method_exists( $this, 'init' ) ) {
			if ( $this->init() === false ) {
				return;
			}
		}

		$this->action_hooks();
		$this->filter_hooks();
	}
}
