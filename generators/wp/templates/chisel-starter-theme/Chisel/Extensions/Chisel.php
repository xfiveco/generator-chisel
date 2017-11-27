<?php

namespace Chisel\Extensions;

class Chisel extends Twig {
	private $manifest = array();

	public function extend() {
		add_filter( 'get_twig', array( $this, 'extendTwig' ) );
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
	 * You can add you own functions to twig here
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	protected function registerTwigFunctions( $twig ) {
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
			'hasVendor'
		);

		$this->registerFunction(
			$twig,
			'rgba'
		);

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
				\Chisel\Settings::DIST_PATH,
				$pathinfo['dirname'],
				$manifest[ $pathinfo['basename'] ]
			);
		} else {
			return sprintf(
				'%s/%s%s',
				get_template_directory_uri(),
				\Chisel\Settings::DIST_PATH,
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

	public function rgba( $hex, $alpha ) {
		list( $r, $g, $b ) = sscanf( $hex, '#%02x%02x%02x' );

		return sprintf( 'rgba(%d, %d, %d, %.2f)', $r, $g, $b, $alpha );
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
