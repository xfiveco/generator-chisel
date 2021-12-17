<?php

namespace Chisel;

/**
 * Class Post
 * @package Chisel
 *
 * Use this class to extend \Timber\Post features
 */
class Post extends \Timber\Post {

	/**
	 * @var string $ImageClass the name of the class to handle images by default
	 */
	public $ImageClass = 'Chisel\Image';

	/**
	 * @var string $PostClass the name of the class to handle posts by default
	 */
	public $PostClass = 'Chisel\Post';

	protected $fakeFields = false;

	/**
	 * Post constructor.
	 * Overrides parent to allow creation of fake posts.
	 *
	 * @param array|int|\WP_Post|\Timber\Post|null $fields
	 */
	public function __construct( $fields = null ) {
		if ( is_array( $fields ) ) {
			if ( isset( $fields['ID'] ) ) {
				parent::__construct( $fields['ID'] );
			}
			$this->prepareFakePost( $fields );
		} else {
			parent::__construct( $fields );
		}
	}

	/**
	 * Creates fake post data based on array of args passed to the method.
	 *
	 * @param array $fields
	 */
	protected function prepareFakePost( $fields ) {
		if ( isset( $fields['_fields'] ) ) {
			$this->fakeFields = $fields['_fields'];
			unset ( $fields['_fields'] );
		}

		foreach ( $fields as $field => $value ) {
			$this->$field = $value;
		}
	}

	/**
	 * Overrides get_field function to use fake meta when provided.
	 *
	 * @param $field_name
	 *
	 * @return mixed
	 */
	public function get_field( $field_name ) {
		if ( $this->fakeFields && isset( $this->fakeFields[ $field_name ] ) ) {
			return $this->fakeFields[ $field_name ];
		}

		return parent::get_field( $field_name );
	}

	/**
	 * Returns Post class name. You can also return an array('post_type' => 'post_type_class_name')
	 *  to use different classes for individual post types.
	 *
	 * @return string|array
	 */
	public static function overrideTimberPostClass() {
		return '\Chisel\Post';
	}
}
