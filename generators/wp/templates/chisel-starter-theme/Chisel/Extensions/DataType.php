<?php

namespace Chisel\Extensions;

/**
 * Class DataType
 * Use this class to register custom post types and taxonomies
 * @package Chisel\Extensions
 */
class DataType implements ChiselExtension {
	public function extend() {
		add_action( 'init', array( $this, 'registerPostTypes' ) );
		add_action( 'init', array( $this, 'registerTaxonomies' ) );
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
