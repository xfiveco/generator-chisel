<?php

namespace Chisel\WP\Custom;

use Chisel\Traits\HooksSingleton;

/**
 * Custom Twig functionality.
 *
 * @package Chisel
 */
class Twig {

	use HooksSingleton;

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'chisel_twig_register_functions', array( $this, 'register_functions' ), 10, 2 );
		add_action( 'chisel_twig_register_filters', array( $this, 'register_filters' ), 10, 2 );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {}

	/**
	 * Register custom twig functions.
	 *
	 * @param \Twig\Environment $twig The Twig environment.
	 * @param \Chisel\WP\Twig   $chisel_twig The Chisel Twig instance.
	 */
	public function register_functions( \Twig\Environment $twig, \Chisel\WP\Twig $chisel_twig ): void {
		// phpcs:disable -- Example of custom function. Remove this line and the phpcs:enable when adding your own custom functions
		// $twig->addFunction( new \Twig\Function( 'custom_fn', array( $this, 'custom_fn_callback' ) ) );
		// phpcs:enable
	}

	/**
	 * Register custom twig filters.
	 *
	 * @param \Twig\Environment $twig The Twig environment.
	 * @param \Chisel\WP\Twig   $chisel_twig The Chisel Twig instance.
	 */
	public function register_filters( \Twig\Environment $twig, \Chisel\WP\Twig $chisel_twig ): void {
		// phpcs:disable -- Example of custom filter. Remove this line and the phpcs:enable when adding your own custom filters
		// $twig->addFilter( new \Twig\Filter( 'custom_filter', array( $this, 'custom_filter_callback' ) ) );
		// phpcs:enable
	}
}
