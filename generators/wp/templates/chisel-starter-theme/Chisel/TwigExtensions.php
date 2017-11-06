<?php

namespace Chisel;

/**
 * Class TwigExtensions
 * @package Chisel
 *
 * Use this class to extend Twig
 */
class TwigExtensions {
	private $manifest = array();

	public function __construct() {
		add_filter( 'get_twig', array( $this, 'extend' ) );
	}

	/**
	 * Get parsed manifest file content
	 *
	 * @return array
	 */
	public function getManifest() {
		if ( empty( $this->manifest ) ) {
			$this->initManifest();
		}

		return $this->manifest;
	}

	/**
	 * Extends Twig, registers filters and functions.
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	public function extend( $twig ) {
		$twig = $this->registerTwigFilters( $twig );
		$twig = $this->registerTwigFunctions( $twig );
		$twig = $this->registerTwigTests( $twig );

		return $twig;
	}

	/**
	 * You can add you own functions to twig here
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	protected function registerTwigFunctions( $twig ) {
		$this->registerFunction(
			$twig,
			'revisionedPath',
			array(
				$this,
				'revisionedPath',
			)
		);

		$this->registerFunction(
			$twig,
			'assetPath',
			array(
				$this,
				'assetPath',
			)
		);

		$this->registerFunction(
			$twig,
			'className',
			array(
				$this,
				'className',
			)
		);

		$this->registerFunction(
			$twig,
			'ChiselPost',
			array(
				$this,
				'chiselPost',
			)
		);

		$this->registerFunction(
			$twig,
			'hasVendor',
			array(
				$this,
				'hasVendor',
			)
		);

		$this->registerFunction(
			$twig,
			'getScriptsPath',
			array(
				$this,
				'getScriptsPath',
			)
		);

		$this->registerFunction(
			$twig,
			'hasWebpackManifest',
			array(
				$this,
				'hasWebpackManifest',
			)
		);

		$this->registerFunction(
			$twig,
			'getWebpackManifest',
			array(
				$this,
				'getWebpackManifest',
			)
		);

		return $twig;
	}

	/**
	 * You can add your own filters to Twig here
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	protected function registerTwigFilters( $twig ) {
//		$this->registerFilter(
//			$twig,
//			'filterName',
//			array(
//				'\Chisel\TwigExtensions',
//				'filter_callback'
//			)
//		);

		return $twig;
	}

	/**
	 * You can add your own tests to Twig here
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	protected function registerTwigTests( $twig ) {
//		$this->registerTest(
//			$twig,
//			'testName',
//			array(
//				'\Chisel\TwigExtensions',
//				'test_callback'
//			)
//		);

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
	public function revisionedPath( $asset ) {
		$pathinfo = pathinfo( $asset );

		if ( ! defined( 'CHISEL_DEV_ENV' ) ) {
			$manifest = $this->getManifest();
			if ( ! array_key_exists( $pathinfo['basename'], $manifest ) ) {
				return 'FILE-NOT-REVISIONED';
			}

			return sprintf(
				'%s/%s%s/%s',
				get_template_directory_uri(),
				Settings::DIST_PATH,
				$pathinfo['dirname'],
				$manifest[ $pathinfo['basename'] ]
			);
		} else {
			return sprintf(
				'%s/%s%s',
				get_template_directory_uri(),
				Settings::DIST_PATH,
				trim( $asset, '/' )
			);
		}
	}

	/**
	 * Returns the real path of the asset file.
	 *
	 * @param $asset
	 *
	 * @return string
	 */
	public function assetPath( $asset ) {
		return sprintf(
			'%s/%s%s',
			get_template_directory_uri(),
			Settings::ASSETS_PATH,
			trim( $asset, '/' )
		);
	}

	/**
	 * Builds class string based on name and modifiers
	 *
	 * @param  string $name base class name
	 * @param  string[] $modifiers,... class name modifiers
	 *
	 * @return string                built class
	 */
	public function className( $name = '', $modifiers = null ) {
		if ( ! is_string( $name ) || empty( $name ) ) {
			return '';
		}
		$modifiers = array_slice( func_get_args(), 1 );
		$classes   = array( $name );
		foreach ( $modifiers as $modifier ) {
			if ( is_string( $modifier ) && ! empty( $modifier ) ) {
				$classes[] = $name . '--' . $modifier;
			}
		}

		return implode( ' ', $classes );
	}

	/**
	 * Creates post with passed properties or loads default post when properties are missing
	 *
	 * @param array|null $fields
	 *
	 * @return Post
	 */
	public function chiselPost( $fields = null ) {
		return new Post( $fields );
	}

	/**
	 * Verifies existence of the vendor.js file
	 *
	 * @return bool
	 */
	public function hasVendor () {
		if( defined( 'CHISEL_DEV_ENV' ) ) {
			return file_exists(
				sprintf(
					'%s/%s%s',
					get_template_directory(),
					Settings::DIST_PATH,
					'scripts/vendor.js'
				)
			);
		} else {
			$manifest = $this->getManifest();
			return array_key_exists( 'vendor.js', $manifest );
		}
	}

	/**
	 * Returns the real path of the scripts directory.
	 *
	 * @return string
	 */
	public function getScriptsPath() {
		return sprintf(
			'%s/%s',
			get_template_directory_uri(),
			Settings::SCRIPTS_PATH
		);
	}

	/**
	 * Verifies existence of webpack manifest file.
	 *
	 * @return bool
	 */
	public function hasWebpackManifest() {
		return file_exists(
			sprintf(
				'%s/%s',
				get_template_directory(),
				Settings::getWebpackManifestPath()
			)
		);
	}

	/**
	 * Returns the contents of the webpack manifest file.
	 *
	 * @return string
	 */
	public function getWebpackManifest() {
		if( $this->hasWebpackManifest() ) {
			return file_get_contents(
				sprintf(
					'%s/%s',
					get_template_directory(),
					Settings::getWebpackManifestPath()
				)
			);
		}
		return '';
	}

	/**
	 * Use this method to register new Twig function
	 *
	 * @param \Twig_Environment $twig
	 * @param $name
	 * @param $callback
	 */
	private function registerFunction( $twig, $name, $callback ) {
		$classNameFunction = new \Twig_SimpleFunction( $name, $callback );
		$twig->addFunction( $classNameFunction );
	}

	/**
	 * Use this method to register new Twig filter
	 *
	 * @param \Twig_Environment $twig
	 * @param $name
	 * @param $callback
	 */
	private function registerFilter( $twig, $name, $callback ) {
		$classNameFilter = new \Twig_SimpleFilter( $name, $callback );
		$twig->addFilter( $classNameFilter );
	}

	/**
	 * Use this method to register new Twig test
	 *
	 * @param \Twig_Environment $twig
	 * @param $name
	 * @param $callback
	 */
	private function registerTest( $twig, $name, $callback ) {
		$classNameTest = new \Twig_SimpleTest( $name, $callback );
		$twig->addTest( $classNameTest );
	}

	/**
	 * Loads data from manifest file.
	 */
	public function initManifest() {
		if ( file_exists( get_template_directory() . '/' . Settings::MANIFEST_PATH ) ) {
			$this->manifest = json_decode(
				file_get_contents( get_template_directory() . '/' . Settings::MANIFEST_PATH ),
				true
			);
		}
	}
}
