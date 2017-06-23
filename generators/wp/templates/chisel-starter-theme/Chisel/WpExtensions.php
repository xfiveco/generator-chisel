<?php

namespace Chisel;

/**
 * Class WpExtensions
 * @package Chisel
 *
 * Use this class to extend Wordpress (register post types, taxonomies, etc.)
 */
class WpExtensions {
	public function extend() {
		self::registerPostTypes();
		self::registerTaxonomies();
	}

	/**
	 * Use this method to register custom post types
	 */
	public static function registerPostTypes() {
		//this is where you can register custom post types
	}

	/**
	 * Use this method to register custom taxonomies
	 */
	public static function registerTaxonomies() {
		//this is where you can register custom taxonomies
	}
}
