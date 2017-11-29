<?php

namespace Chisel\Extensions;

/**
 * Class Theme
 * Use this class to extend theme functionality
 * @package Chisel\Extensions
 */
class Theme implements ChiselExtension {
	public function extend() {
		$this->addThemeSupports();
	}

	private function addThemeSupports() {
		add_theme_support( 'post-formats' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'menus' );
		add_theme_support( 'title-tag' );
	}
}
