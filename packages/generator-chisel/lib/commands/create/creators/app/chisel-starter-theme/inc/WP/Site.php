<?php

namespace Chisel\WP;

use Automattic\WooCommerce\Internal\Admin\ProductForm\Component;
use Timber\Timber;
use Timber\Site as TimberSite;

use Chisel\Interface\InstanceInterface;
use Chisel\Interface\HooksInterface;
use Chisel\Trait\Singleton;

/**
 * Site related functionality related to timber.
 *
 * @package Chisel
 */
class Site extends TimberSite implements InstanceInterface, HooksInterface {

	use Singleton;

	/**
	 * Class constructor.
	 */
	private function __construct() {
		add_action( 'after_setup_theme', array( $this, 'set_properties' ), 7 );

		$this->action_hooks();
		$this->filter_hooks();

		parent::__construct();
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
		add_filter( 'timber/context', array( $this, 'add_to_context' ) );
		add_filter( 'timber/post/classmap', array( $this, 'post_classmap' ) );
		add_filter( 'timber/term/classmap', array( $this, 'term_classmap' ) );
	}

	/**
	 * Add data to the context.
	 *
	 * @param array $context The context.
	 * @return array
	 */
	public function add_to_context( $context ) {
		$context['logo']            = Components::get_logo();
		$context['menus']           = Components::get_menus();
		$context['sidebar']         = Components::get_sidebar();
		$context['footer_sidebars'] = Components::get_footer_sidebars();
		$context['the_title']       = Components::get_the_title();

		return $context;
	}

	/**
	 * Add custom post class map.
	 *
	 * @param array $classmap The class map.
	 * @return array
	 */
	public function post_classmap( $classmap ) {
		$custom_classmap = array(
			'post'       => ChiselPost::class,
			'page'       => ChiselPost::class,
			'product'    => ChiselProduct::class,
			'attachment' => ChiselImage::class,
		);

		return array_merge( $classmap, $custom_classmap );
	}

	/**
	 * Add custom term class map.
	 *
	 * @param array $classmap The class map.
	 * @return array
	 */
	public function term_classmap( $classmap ) {
		$custom_classmap = array(
			'category' => ChiselTerm::class,
		);

		return array_merge( $classmap, $custom_classmap );
	}
}
