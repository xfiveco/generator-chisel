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

	/**
	 * Get relative path of webpack manifest based on environment
	 *
	 * @return string
	 */
	public static function getWebpackManifestPath() {
		if( defined( 'CHISEL_DEV_ENV' ) ) {
			return self::WEBPACK_MANIFEST_DEV_PATH;
		} else {
			return self::WEBPACK_MANIFEST_PATH;
		}
	}
}
