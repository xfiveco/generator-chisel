<?php

namespace Chisel\Enums;

enum BlocksType: string {
	case ACF = 'acf';
	case WP  = 'wp';

	/**
	 * Get the folder name based on the blocks type.
	 *
	 * @return string
	 */
	public function folder_name(): string {
		return $this === self::ACF ? 'blocks-acf' : 'blocks';
	}
}
