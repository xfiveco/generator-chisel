<?php

namespace Chisel;

/**
 * Class TwigExtensions
 * @package Chisel
 *
 * Use this class to extend Twig
 */
class TwigExtensions {
	private static $manifest = array();

	/**
	 * Get parsed manifest file content
	 *
	 * @return array
	 */
	public function getManifest() {
		if ( empty( self::$manifest ) ) {
			self::initManifest();
		}

		return self::$manifest;
	}

	/**
	 * Extends Twig, registers filters and functions.
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	public function extend( $twig ) {
		$twig = self::registerTwigFilters( $twig );
		$twig = self::registerTwigFunctions( $twig );

		return $twig;
	}

	/**
	 * You can add you own functions to twig here
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	private static function registerTwigFunctions( $twig ) {
		self::registerFunction(
			$twig,
			'revisionedPath',
			array(
				'\Chisel\TwigExtensions',
				'revisionedPath',
			)
		);

		self::registerFunction(
			$twig,
			'assetPath',
			array(
				'\Chisel\TwigExtensions',
				'assetPath',
			)
		);

		self::registerFunction(
			$twig,
			'className',
			array(
				'\Chisel\TwigExtensions',
				'className',
			)
		);

		self::registerFunction(
			$twig,
			'ChiselPost',
			array(
				'\Chisel\TwigExtensions',
				'chiselPost',
			)
		);

		return $twig;
	}

	/**
	 * You can add your own filters to twig here
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	private static function registerTwigFilters( $twig ) {
//		self::registerTwigFilter(
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
	 * Returns the real path of the revisioned file.
	 * When CHISEL_DEV_ENV is defined it returns
	 *  path based on the manifest file content.
	 *
	 * @param $asset
	 *
	 * @return string
	 */
	public static function revisionedPath( $asset ) {
		$pathinfo = pathinfo( $asset );

		if ( ! defined( 'CHISEL_DEV_ENV' ) ) {
			$manifest = self::getManifest();
			if ( ! array_key_exists( $pathinfo['basename'], $manifest ) ) {
				return 'FILE-NOT-REVISIONED';
			}

			return sprintf(
				'%s/%s%s/%s',
				get_template_directory_uri(),
				DIST_PATH,
				$pathinfo['dirname'],
				$manifest[ $pathinfo['basename'] ]
			);
		} else {
			return sprintf(
				'%s/%s%s',
				get_template_directory_uri(),
				DIST_PATH,
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
	public static function assetPath( $asset ) {
		return sprintf(
			'%s/%s%s',
			get_template_directory_uri(),
			ASSETS_PATH,
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
	public static function className( $name = '', $modifiers = null ) {
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
		if ( ! is_array( $fields ) ) {
			return new Post( $fields );
		}

		return new Post( $fields );
	}

	/**
	 * Use this method to register new Twig function
	 *
	 * @param \Twig_Environment $twig
	 * @param $name
	 * @param $callback
	 */
	private static function registerFunction( $twig, $name, $callback ) {
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
	private static function registerFilter( $twig, $name, $callback ) {
		$classNameFilter = new \Twig_SimpleFilter( $name, $callback );
		$twig->addFilter( $classNameFilter );
	}

	/**
	 * Loads data from manifest file.
	 */
	public static function initManifest() {
		if ( file_exists( get_template_directory() . '/' . MANIFEST_PATH ) ) {
			self::$manifest = json_decode(
				file_get_contents( get_template_directory() . '/' . MANIFEST_PATH ),
				true
			);
		}
	}
}
