<?php

namespace Chisel\Extensions;

/**
 * Interface ChiselExtension
 * @package Chisel\Extensions
 */
interface ChiselExtension {
	/**
	 * Method used to run call Extension after instantiating
	 */
	public function extend();
}
