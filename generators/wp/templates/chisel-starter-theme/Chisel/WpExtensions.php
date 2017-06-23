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

	public static function registerPostTypes() {
		//this is where you can register custom post types
	}

	public static function registerTaxonomies() {
		//this is where you can register custom taxonomies
	}
}
