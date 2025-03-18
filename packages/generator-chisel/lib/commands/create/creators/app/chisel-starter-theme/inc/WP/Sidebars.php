<?php

namespace Chisel\WP;

use Chisel\Interfaces\InstanceInterface;
use Chisel\Interfaces\HooksInterface;
use Chisel\Traits\Singleton;

/**
 * WordPress Sidebars setup related functionality.
 *
 * @package Chisel
 */
class Sidebars implements InstanceInterface, HooksInterface {

	use Singleton;

	/**
	 * Sidebars to register.
	 *
	 * @var array
	 */
	private $sidebars = array();

	/**
	 * Class constructor.
	 */
	private function __construct() {
		add_action( 'after_setup_theme', array( $this, 'set_properties' ), 7 );

		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {
		$this->sidebars = array(
			'blog'      => array(
				'name'        => __( 'Blog', 'chisel' ),
				'description' => __( 'Sidebar for blog pages', 'chisel' ),
			),
			'footer-1'  => array(
				'name'        => __( 'Footer Column 1', 'chisel' ),
				'description' => __( 'First column in the footer', 'chisel' ),
			),
			'footer-2'  => array(
				'name'        => __( 'Footer Column 2', 'chisel' ),
				'description' => __( 'Second column in the footer', 'chisel' ),
			),
			'footer-3'  => array(
				'name'        => __( 'Footer Column 3', 'chisel' ),
				'description' => __( 'Third column in the footer', 'chisel' ),
			),
			'footer-4'  => array(
				'name'        => __( 'Footer Column 4', 'chisel' ),
				'description' => __( 'Fourth column in the footer', 'chisel' ),
			),
			'copyright' => array(
				'name'        => __( 'Copyright', 'chisel' ),
				'description' => __( 'Footer copyright', 'chisel' ),
			),
		);
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
		add_action( 'widgets_init', array( $this, 'register_sidebars' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
	}

	/**
	 * Register sidebars.
	 */
	public function register_sidebars() {
		$this->sidebars = apply_filters( 'chisel_sidebars', $this->sidebars );

		if ( ! $this->sidebars ) {
			return;
		}

		foreach ( $this->sidebars as $id => $data ) {
			register_sidebar(
				array(
					'name'          => $data['name'],
					'id'            => 'chisel-sidebar-' . $id,
					'description'   => $data['description'],
					'before_widget' => '<section id="%1$s" class="c-widget %2$s">',
					'after_widget'  => '</section>',
					'before_title'  => '<h3 class="c-widget__title">',
					'after_title'   => '</h3>',
				)
			);
		}
	}
}
