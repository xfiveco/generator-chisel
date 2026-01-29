<?php

namespace Chisel\Traits;

use Chisel\Traits\Singleton;
use Chisel\Traits\Hooks;

trait HooksSingleton {
	use Singleton;
	use Hooks;

	/**
	 * Properties hook.
	 *
	 * @var array
	 */
	protected function properties_hook(): array {
		return array(
			'action'   => 'after_setup_theme',
			'priority' => 7,
			'args'     => 1,
		);
	}

	/**
	 * Should call parent constructor.
	 *
	 * @return bool
	 */
	protected function should_call_parent_construct(): bool {
		return false;
	}

	/**
	 * Class constructor - boot the class.
	 */
	protected function __construct() {
		if ( $this->should_call_parent_construct() ) {
			parent::__construct();
		}

		if ( method_exists( $this, 'set_properties' ) ) {
			$properties_hook = $this->properties_hook();
			add_action(
				$properties_hook['action'],
				array( $this, 'set_properties' ),
				$properties_hook['priority'],
				$properties_hook['args']
			);
		}

		$this->boot();
	}
}
