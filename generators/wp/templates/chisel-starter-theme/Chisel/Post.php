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
	 * @param $default_value mixed Default value if field is empty
	 *
	 * @return mixed
	 */
	public function get_field( $field_name, $default_value = null ) {
		$value = null;
		if ( $this->fakeFields && isset( $this->fakeFields[ $field_name ] ) ) {
			$value = $this->fakeFields[ $field_name ];
		} else {
			$value = $this->_get_field( $field_name );
		}

		return $value ? $value : $default_value;
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

	/**
	 * @param string $field_name
	 *
	 * @return mixed
	 */
	private function _get_field( $field_name ) {
		if ( $rd = $this->get_revised_data_from_method( 'get_field', $field_name ) ) {
			return $rd;
		}
		$value = apply_filters( 'timber_post_get_meta_field_pre', null, $this->ID, $field_name, $this );
		if ( $value === null ) {
			$value = get_post_meta( $this->ID, $field_name );
			if ( is_array( $value ) && count( $value ) == 1 ) {
				$value = $value[0];
			}
			if ( is_array( $value ) && count( $value ) == 0 ) {
				$value = null;
			}
		}
		$value = apply_filters( 'timber_post_get_meta_field', $value, $this->ID, $field_name, $this );
		$value = $this->convert( $value, get_class( $this ) );

		return $value;
	}
}
