<?php

namespace Chisel;

use Automattic\WooCommerce\Internal\Admin\ProductForm\Component;
use Timber\Timber;
use Timber\Site as TimberSite;

/**
 * Site related functionality related to timber.
 *
 * @package Chisel
 */
class Site extends TimberSite implements Instance {

	/**
	 * Class constructor.
	 */
	private function __construct() {
		$this->set_properties();
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
		add_filter( 'timber/context', array( $this, 'set_page_title' ) );
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

		return $context;
	}

	/**
	 * Set the page / post title
	 *
	 * @param array $context The context.
	 *
	 * @return array
	 */
	public function set_page_title( $context ) {
		global $post;

		if ( isset( $post->post_type ) ) {
			$context['the_title'] = Components::get_the_title( $post->ID );
		}

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
			'post'       => ExtendedPost::class,
			'page'       => ExtendedPost::class,
			'product'    => ExtendedProduct::class,
			'attachment' => ExtendedImage::class,
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
			'category' => ExtendedTerm::class,
		);

		return array_merge( $classmap, $custom_classmap );
	}

	/**
	 * Get the instance of the class.
	 */
	public static function get_instance() {
		static $instance = null;

		if ( null === $instance ) {
			$instance = new self();
		}

		return $instance;
	}
}
