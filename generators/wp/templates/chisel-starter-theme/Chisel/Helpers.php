<?php

namespace Chisel;

/**
 * Class Helpers
 * @package Chisel
 *
 * Defines helper methods used by Chisel
 */
class Helpers {
	public static function isTimberActivated() {
		return class_exists( 'Timber\\Timber' );
	}

	public static function addTimberAdminNotice() {
		add_action( 'admin_notices',
			function () {
				echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
			}
		);
	}

	public static function setChiselEnv() {
		if ( isset( $_SERVER['HTTP_X_CHISEL_PROXY'] ) ) {
			define( 'CHISEL_DEV_ENV', true );
		}
	}
}
