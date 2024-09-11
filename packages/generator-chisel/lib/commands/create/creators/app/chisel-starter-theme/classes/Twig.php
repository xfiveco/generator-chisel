<?php

namespace Chisel;

use Timber\Timber;

/**
 * Class used to extend Timber functionality.
 *
 * @package Chisel
 */
class Twig implements Instance {

	/**
	 * Class constructor.
	 */
	private function __construct() {
		$this->set_properties();
		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
		add_filter( 'timber/twig', array( $this, 'extend_twig' ) );
	}

	/**
	 * Extend Twig functionality.
	 *
	 * @param \Twig_Environment $twig The Twig environment.
	 * @return \Twig_Environment
	 */
	public function extend_twig( $twig ) {
		$twig = $this->register_functions( $twig );
		$twig = $this->register_filters( $twig );
		$twig = $this->register_tests( $twig );

		return $twig;
	}

	/**
	 * Register custom Twig functions.
	 *
	 * @param \Twig_Environment $twig The Twig environment.
	 * @return \Twig_Environment
	 */
	public function register_functions( $twig ) {
		$this->register_function( $twig, 'get_nav_menu', array( $this, 'get_nav_menu' ) );
		$this->register_function( $twig, 'timber_set_product', array( $this, 'timber_set_product' ) );
		$this->register_function( $twig, 'post_classes', array( $this, 'post_classes' ) );
		$this->register_function( $twig, 'slider_prepare_params', array( $this, 'slider_prepare_params' ) );
		$this->register_function( $twig, 'get_responsive_image', array( $this, 'get_responsive_image' ) );
		$this->register_function( $twig, 'comments_template', array( $this, 'comments_template' ) );

		return $twig;
	}

	/**
	 * Register custom Twig filters.
	 *
	 * @param \Twig_Environment $twig The Twig environment.
	 * @return \Twig_Environment
	 */
	public function register_filters( $twig ) {

		return $twig;
	}

	/**
	 * Register custom Twig tests.
	 *
	 * @param \Twig_Environment $twig The Twig environment.
	 * @return \Twig_Environment
	 */
	public function register_tests( $twig ) {

		return $twig;
	}

	/**
	 * Register a Twig function.
	 *
	 * @param   \Twig_Environment $twig The Twig environment.
	 * @param   string            $name The name of the function.
	 * @param   callable          $callback The callback function.
	 *
	 * @return \Twig_Environment
	 */
	protected function register_function( $twig, $name, $callback ) {
		$twig->addFunction( new \Twig\TwigFunction( $name, $callback ) );

		return $twig;
	}

	/**
	 * Get the navigation menu.
	 *
	 * @param string $menu_name The menu name.
	 * @return string
	 */
	public function get_nav_menu( $menu_name ) {
		$context = Timber::context();

		return $context['menus'][$menu_name];
	}

	/**
	 * Set the product object.
	 *
	 * @param object $post The post object.
	 */
	public function timber_set_product( $post ) {
		return Woocommerce::timber_set_product( $post );
	}

	/**
	 * Prepare post classnames to follow ITCSS structure.
	 *
	 * @param string $classes The post classes.
	 * @param string $prefix The prefix e.g. c-post--.
	 *
	 * @return string
	 */
	public function post_classes( $classes, $prefix = 'c-post--' ) {
		$classnames = explode( ' ', $classes );
		$classnames = array_map(
			function ( $classname ) use ( $prefix ) {
				return $prefix . $classname;
			},
			$classnames
		);

		return implode( ' ', $classnames );
	}

	/**
	 * Prepare slider params for data attributes
	 *
	 * @param array $params
	 *
	 * @return array
	 */
	public function slider_prepare_params( $params ) {
		$defaults        = array(
			'type' => 'default',
		);
		$prepared_params = array(
			'data'  => array(),
			'attrs' => array(),
		);

		if ( isset( $params['block_settings'] ) ) {
			$block_settings  = $params['block_settings'];
			$slider_settings = $block_settings['slider_settings'];
			unset( $params['block_settings'] );

			if ( in_array( 'arrows', $slider_settings, true ) ) {
				$params['arrows'] = 'yes';
			}

			if ( in_array( 'dots', $slider_settings, true ) ) {
				$params['dots'] = 'yes';
				$dynamic_dots   = isset( $block_settings['slider_settings_dynamic_dots'] ) ? esc_attr( $block_settings['slider_settings_dynamic_dots'] ) : 'no';

				if ( $dynamic_dots === 'yes' ) {
					$params['dots-dynamic'] = 1;
				}
			}

			if ( in_array( 'loop', $slider_settings, true ) ) {
				$params['loop'] = 'yes';
			}

			if ( in_array( 'autoplay', $slider_settings, true ) ) {
				$autoplay_timeout           = isset( $block_settings['slider_settings_autoplay_timeout'] ) ? absint( $block_settings['slider_settings_autoplay_timeout'] ) : 5000;
				$params['autoplay']         = 'yes';
				$params['autoplay-timeout'] = $autoplay_timeout;
			}

			if ( in_array( 'thumbnails', $slider_settings, true ) ) {
				$thumbnails_no        = isset( $block_settings['slider_settings_thumbnails_no'] ) ? absint( $block_settings['slider_settings_thumbnails_no'] ) : 8;
				$params['thumbnails'] = $thumbnails_no;
			}
		}

		if ( $params ) {
			$params = wp_parse_args( $params, $defaults );

			foreach ( $params as $param_name => $param_value ) {
				if ( is_array( $param_value ) || is_object( $param_value ) ) {
					$value = Helpers::json_encode_for_data_attribute( $param_value );
				} else {
					$value = sanitize_text_field( $param_value );
				}

				$prepared_params['data'][$param_name]  = $value;
				$prepared_params['attrs'][$param_name] = sprintf( 'data-%s="%s"', $param_name, $value );
			}
		}

		return $prepared_params;
	}

	/**
	 * Get responsive image html
	 *
	 * @param int    $image_id Image ID.
	 * @param string $image_size Image size.
	 *
	 * @return string
	 */
	public function get_responsive_image( $image_id, $image_size ) {
		return Timber::get_image( $image_id )->responsive( $image_size );
	}

	/**
	 * Display comments template - the comments and the form.
	 */
	public function comments_template() {
		return Comments::comments_template();
	}

	/**
	 * Get the instance of the class.
	 */
	public static function get_instance() {
		static $instance = null;

		if ( null === $instance ) {
			$instance = new self();
		}

		return $instance;
	}
}
