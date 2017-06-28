<?php

namespace Chisel;

/**
 * Class Site
 * @package Chisel
 *
 * Use this class to setup whole site related configuration
 */
class Site extends \Timber\Site {
	/**
	 * Site constructor.
	 */
	public function __construct() {
		// set default twig templates directory
		\Timber\Timber::$dirname = TEMPLATES_DIR;

		$this->chiselInit();

		parent::__construct();
	}

	/**
	 * Initiate chisel configuration.
	 */
	public function chiselInit() {
		add_theme_support( 'post-formats' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'menus' );
		add_filter( 'timber_context', array( $this, 'addToContext' ) );
		add_filter( 'get_twig', array( '\Chisel\TwigExtensions', 'extend' ) );
		add_action( 'init', array( '\Chisel\WpExtensions', 'extend' ) );
		add_filter( 'Timber\PostClassMap', array( '\Chisel\Post', 'overrideTimberPostClass' ) );
	}

	/**
	 * You can add custom global data to twig context
	 *
	 * @param array $context
	 *
	 * @return array
	 */
	public static function addToContext( $context ) {
		$context['main_nav'] = new \Timber\Menu();
		$context['post']     = new \Chisel\Post();

		return $context;
	}
}
