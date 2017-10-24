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
		$this->themeSupport();
		add_action( 'init', array( $this, 'init' ) );
	}

	private function themeSupport() {
		add_theme_support( 'post-formats' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'menus' );
		add_theme_support( 'title-tag' );
	}

	public function init() {
		$this->registerPostTypes();
		$this->registerTaxonomies();
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
}
