<?php

namespace Chisel;

/**
 * Class WpExtensions
 * @package Chisel
 *
 * Use this class to extend Wordpress (register post types, taxonomies, etc.)
 */
class WpExtensions {
	public function __construct() {
		add_action( 'init', array( $this, 'extend' ) );
	}

	public function extend() {
		$this->themeSupport();
		$this->registerPostTypes();
		$this->registerTaxonomies();
		$this->addImagesSizes();
	}

	public function themeSupport() {
		add_theme_support( 'post-formats' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'menus' );
	}

	/**
	 * Use this method to register custom post types
	 */
	public function registerPostTypes() {
	}

	/**
	 * Use this method to register custom taxonomies
	 */
	public function registerTaxonomies() {
	}

	/**
	 * Use this method to register custom image sizes
	 */
	public function addImagesSizes() {
		// add_image_size( 'hero', 3000, 9999 );
	}
}
