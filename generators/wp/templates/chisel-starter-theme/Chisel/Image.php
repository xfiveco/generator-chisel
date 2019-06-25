<?php

namespace Chisel;

class Image extends \Timber\Image {

	/**
	 * @var string $ImageClass the name of the class to handle images by default
	 */
	public $ImageClass = 'Chisel\Image';

	/**
	 * @var string $PostClass the name of the class to handle posts by default
	 */
	public $PostClass = 'Chisel\Post';

	/**
	 * Checks whether attachment is an image. Duplicate from \Timber\Image due to @internal flag.
	 *
	 * @internal
	 * @return bool true if media is an image
	 */
	protected function is_image() {
		$src = wp_get_attachment_url($this->ID);
		$image_exts = array( 'jpg', 'jpeg', 'jpe', 'gif', 'png' );
		$check = wp_check_filetype(basename($src), null);
		return in_array($check['ext'], $image_exts);
	}
}
