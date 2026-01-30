<?php

namespace Chisel\WP;

use Chisel\Traits\HooksSingleton;
use Chisel\Factories\RegisterCustomPostType;

/**
 * Custom post types and taxonomies wrapper class.
 *
 * @package Chisel
 */
final class CustomPostTypes {

	use HooksSingleton;

	/**
	 * Post types.
	 *
	 * @var array
	 */
	private array $post_types = array();

	/**
	 * Default post type supports.
	 *
	 * @var array
	 */
	private array $default_post_type_supports = array();

	/**
	 * Default post type rewrite args.
	 *
	 * @var array
	 */
	private array $default_post_type_rewrite_args = array();

	/**
	 * Set properties.
	 */
	public function set_properties(): void {
		$this->default_post_type_supports     = (array) apply_filters( 'chisel_default_post_type_supports', array( 'title', 'page-attributes', 'revisions', 'author' ) );
		$this->default_post_type_rewrite_args = (array) apply_filters(
			'chisel_default_post_type_rewrite_args',
			array(
				'slug'       => '',
				'with_front' => true,
				'feeds'      => true,
				'pages'      => true,
				'ep_mask'    => EP_PERMALINK,
			)
		);
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'init', array( $this, 'register_post_types' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {}

	/**
	 * Register custom post types.
	 */
	public function register_post_types(): void {
		$this->post_types = apply_filters( 'chisel_custom_post_types', $this->post_types );

		if ( empty( $this->post_types ) ) {
			return;
		}

		$defaults = array(
			'supports'     => $this->default_post_type_supports,
			'rewrite_args' => $this->default_post_type_rewrite_args,
		);

		foreach ( $this->post_types as $post_type => $post_type_args ) {
			$register_custom_post_type_factory = new RegisterCustomPostType( $post_type, $post_type_args, $defaults );
			$register_custom_post_type_factory->register_post_type();
		}
	}

	/**
	 * Get custom post types.
	 *
	 * @return array
	 */
	public static function get_post_types(): array {
		return self::get_instance()->post_types;
	}
}
