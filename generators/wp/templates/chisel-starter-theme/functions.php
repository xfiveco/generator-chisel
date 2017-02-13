<?php

if ( ! class_exists( 'Timber' ) ) {
	add_action( 'admin_notices',
		function () {
			echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
		} );

	return;
}

include get_template_directory() . '/features/ChiselPost.php';

if ( isset( $_SERVER['HTTP_X_CHISEL_PROXY'] ) ) {
	define( 'CHISEL_DEV_ENV', true );
}

// set default twig templates directory
Timber::$dirname = array( 'templates' );

class StarterSite extends TimberSite {
	const DIST_PATH = 'dist/';
	const ASSETS_PATH = 'dist/assets/';

	private $manifestPath = 'dist/rev-manifest.json';
	private $manifest = array();

	public function __construct() {
		add_theme_support( 'post-formats' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'menus' );
		add_filter( 'timber_context', array( $this, 'add_to_context' ) );
		add_filter( 'get_twig', array( $this, 'add_to_twig' ) );
		add_action( 'init', array( $this, 'register_post_types' ) );
		add_action( 'init', array( $this, 'register_taxonomies' ) );

		// load filenames from manifest file
		// used to determinate asset real path
		if ( ! defined( 'CHISEL_DEV_ENV' ) && file_exists( get_template_directory() . '/' . $this->manifestPath ) ) {
			$this->manifest = json_decode( file_get_contents( get_template_directory() . '/' . $this->manifestPath ),
				true );
		}

		add_filter( 'Timber\PostClassMap', array( $this, 'override_timber_post_class' ) );

		parent::__construct();
	}

	/**
	 * Returns Post class name. You can also return an array('post_type' => 'post_type_class_name')
	 *  to use different classes for individual post types.
	 *
	 * @param $post_class
	 *
	 * @return string|array
	 */
	public function override_timber_post_class( $post_class ) {
		return 'ChiselPost';
	}

	public function register_post_types() {
		//this is where you can register custom post types
	}

	public function register_taxonomies() {
		//this is where you can register custom taxonomies
	}

	/**
	 * You can add custom global data to twig context
	 *
	 * @param $context
	 *
	 * @return mixed
	 */
	public function add_to_context( $context ) {
		$context['main_nav'] = new TimberMenu();
		$context['post'] = new ChiselPost();

		return $context;
	}

	/**
	 * You can add you own functions to twig here
	 *
	 * @param $twig
	 *
	 * @return mixed
	 */
	public function add_to_twig( $twig ) {
		// Adds revisionedPath function to twig
		$revisionedPathFunction = new Twig_SimpleFunction( 'revisionedPath', array(
			$this,
			'twig_revisioned_path'
		) );
		$twig->addFunction( $revisionedPathFunction );

		// Adds assetPath function to twig
		$assetPathFunction = new Twig_SimpleFunction( 'assetPath', array(
			$this,
			'twig_asset_path'
		) );
		$twig->addFunction( $assetPathFunction );

		return $twig;
	}

	/**
	 * Returns the real path of the revisioned file.
	 * When CHISEL_DEV_ENV is defined it returns
	 *  path based on the manifest file content.
	 *
	 * @param $asset
	 *
	 * @return string
	 */
	public function twig_revisioned_path( $asset ) {
		$pathinfo = pathinfo( $asset );

		if ( ! defined( 'CHISEL_DEV_ENV' ) ) {
			if( ! array_key_exists( $pathinfo['basename'], $this->manifest ) ) {
				return 'FILE-NOT-REVISIONED';
			}
			return get_template_directory_uri() . '/' . self::DIST_PATH . $pathinfo['dirname'] . '/' . $this->manifest[ $pathinfo['basename'] ];
		} else {
			return get_template_directory_uri() . '/' . self::DIST_PATH . trim( $asset, '/' );
		}
	}

	/**
	 * Returns the real path of the asset file.
	 *
	 * @param $asset
	 *
	 * @return string
	 */
	public function twig_asset_path( $asset ) {
		return get_template_directory_uri() . '/' . self::ASSETS_PATH . trim( $asset, '/' );
	}
}

new StarterSite();
