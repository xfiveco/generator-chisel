<?php

namespace Chisel\Extensions;

/**
 * Class Chisel
 * Chisel specific twig extensions. This class should not be changed during development.
 * @package Chisel\Extensions
 */
class ChiselTwig extends Twig {
	private $manifest = array();

	public function extend() {
		add_filter( 'timber/loader/twig', array( $this, 'extendTwig' ) );
	}

	/**
	 * Extends Twig, registers filters and functions.
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	public function extendTwig( $twig ) {
		$this->registerFunction(
			$twig,
			'revisionedPath'
		);

		$this->registerFunction(
			$twig,
			'assetPath'
		);

		$this->registerFunction(
			$twig,
			'className'
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
			'ChiselImage',
			array(
				$this,
				'chiselImage',
			)
		);

		$this->registerFunction(
			$twig,
			'Image',
			array(
				$this,
				'chiselImage',
			)
		);

		$this->registerFunction(
			$twig,
			'hasVendor'
		);

		$this->registerFunction(
			$twig,
			'getScriptsPath'
		);

		$this->registerFunction(
			$twig,
			'hasWebpackManifest'
		);

		$this->registerFunction(
			$twig,
			'getWebpackManifest'
		);

		return $twig;
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
				\Chisel\Settings::DIST_PATH,
				$pathinfo['dirname'],
				$manifest[ $pathinfo['basename'] ]
			);
		} else {
			return sprintf(
				'%s/%s%s%s',
				get_template_directory_uri(),
				\Chisel\Settings::DIST_PATH,
				trim( $asset, '/' ),
				'?' . time()
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
			\Chisel\Settings::ASSETS_PATH,
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
	 * @return \Chisel\Post
	 */
	public function chiselPost( $fields = null ) {
		return new \Chisel\Post( $fields );
	}

	/**
	 * Encapsulates image with specified class class (works also for arrays)
	 *
	 * @param array|null $pid
	 * @param string $ImageClass
	 *
	 * @return array|\Chisel\Image
	 */
	public function chiselImage( $pid, $ImageClass = '\Chisel\Image' ) {
		if ( is_array($pid) && !\Timber\Helper::is_array_assoc($pid) ) {
			foreach ( $pid as &$p ) {
				$p = new $ImageClass($p);
			}
			return $pid;
		}
		return new $ImageClass($pid);
	}

	/**
	 * Verifies existence of the vendor.js file
	 *
	 * @return bool
	 */
	public function hasVendor() {
		if ( defined( 'CHISEL_DEV_ENV' ) ) {
			return file_exists(
				sprintf(
					'%s/%s%s',
					get_template_directory(),
					\Chisel\Settings::DIST_PATH,
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
			\Chisel\Settings::SCRIPTS_PATH
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
				\Chisel\Settings::getWebpackManifestPath()
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
					\Chisel\Settings::getWebpackManifestPath()
				)
			);
		}
		return '';
	}

	/**
	 * Loads data from manifest file.
	 */
	private function initManifest() {
		if ( file_exists( get_template_directory() . '/' . \Chisel\Settings::MANIFEST_PATH ) ) {
			$this->manifest = json_decode(
				file_get_contents( get_template_directory() . '/' . \Chisel\Settings::MANIFEST_PATH ),
				true
			);
		}
	}
}
