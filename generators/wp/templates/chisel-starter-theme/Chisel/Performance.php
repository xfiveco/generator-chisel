<?php

namespace Chisel;

/**
 * Class Performance
 * @package Chisel
 *
 * Default performance settings for Chisel
 */
class Performance {
	public function __construct() {
		add_filter('script_loader_tag', array($this, 'asyncScripts'));
	}

	/**
	 * Defer scripts
	 * @param  string $tag Script tag
	 * @return string      Script tag
	 */
	public function asyncScripts($tag) {
		if (is_admin()) {
			return $tag;
		}
		return str_replace( ' src', ' async src', $tag );
	}

}
