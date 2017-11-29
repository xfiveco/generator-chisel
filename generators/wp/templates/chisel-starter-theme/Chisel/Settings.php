<?php

namespace Chisel;

/**
 * Class Settings
 * @package Chisel
 *
 * Use this class to store configuration constants
 */
class Settings {
	const MANIFEST_PATH = 'dist/rev-manifest.json';
	const WEBPACK_MANIFEST_PATH = 'dist/scripts/manifest.json';
	const WEBPACK_MANIFEST_DEV_PATH = 'dist/scripts/manifest-dev.json';
	const DIST_PATH = 'dist/';
	const ASSETS_PATH = 'dist/assets/';
	const SCRIPTS_PATH = 'dist/scripts/';
	const TEMPLATES_DIR = 'templates';

	private $extensions = array( 'ChiselTwig', 'Twig', 'Theme', 'DataType' );

	/**
	 * Get relative path of webpack manifest based on environment
	 *
	 * @return string
	 */
	public static function getWebpackManifestPath() {
		if ( defined( 'CHISEL_DEV_ENV' ) ) {
			return self::WEBPACK_MANIFEST_DEV_PATH;
		} else {
			return self::WEBPACK_MANIFEST_PATH;
		}
	}

	public function __construct() {
		$this->loadExtensions();
	}

	/**
	 * Instantiate and call all extensions listed in self::EXTENSIONS
	 * @throws \Exception
	 */
	private function loadExtensions() {
		foreach ( $this->extensions as $extension ) {
			$class     = "\Chisel\Extensions\\${extension}";
			$extension = new $class();
			if ( ! $extension instanceof Extensions\ChiselExtension ) {
				throw new \Exception( 'Extension has to implement ChiselExtension interface' );
			}
			$extension->extend();
		}
	}
}
