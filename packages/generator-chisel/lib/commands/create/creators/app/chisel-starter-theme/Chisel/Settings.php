<?php

namespace Chisel;

/**
 * Class Settings
 * @package Chisel
 *
 * Use this class to store configuration constants
 */
class Settings {
	const MANIFEST_PATH     = 'dist/manifest.json';
	const MANIFEST_DEV_PATH = 'dist/manifest-dev.json';
	const DIST_PATH         = 'dist/';
	const ASSETS_PATH       = 'assets/';
	const TEMPLATES_DIR     = 'templates';

	private $extensions = array( 'ChiselTwig', 'Twig', 'Theme', 'DataType' );

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
