<?php

namespace Chisel\WP;

use Timber\Timber;

use Chisel\Traits\HooksSingleton;
use Chisel\Helpers\CommentsHelpers;
use Chisel\Helpers\DataHelpers;
use Chisel\Helpers\ImageHelpers;
use Chisel\Helpers\ThemeHelpers;
use Chisel\Helpers\WoocommerceHelpers;
use Chisel\Helpers\YoastHelpers;
use Chisel\WP\Components;

/**
 * Class used to extend Timber functionality.
 *
 * @package Chisel
 */
final class Twig {

	use HooksSingleton;

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'timber/twig', array( $this, 'extend_twig' ) );
	}

	/**
	 * Extend Twig functionality.
	 *
	 * @param \Twig\Environment $twig The Twig environment.
	 * @return \Twig\Environment
	 */
	public function extend_twig( \Twig\Environment $twig ): \Twig\Environment {
		$twig = $this->register_functions( $twig );
		$twig = $this->register_filters( $twig );
		$twig = $this->register_tests( $twig );

		return $twig;
	}

	/**
	 * Register custom Twig functions.
	 *
	 * @param \Twig\Environment $twig The Twig environment.
	 * @return \Twig\Environment
	 */
	public function register_functions( \Twig\Environment $twig ): \Twig\Environment {
		$this->register_function( $twig, 'get_nav_menu', array( $this, 'get_nav_menu' ) );
		$this->register_function( $twig, 'timber_set_product', array( $this, 'timber_set_product' ) );
		$this->register_function( $twig, 'post_classes', array( $this, 'post_classes' ) );
		$this->register_function( $twig, 'slider_prepare_params', array( $this, 'slider_prepare_params' ) );
		$this->register_function( $twig, 'get_responsive_image', array( $this, 'get_responsive_image' ) );
		$this->register_function( $twig, 'comments_template', array( $this, 'comments_template' ) );
		$this->register_function( $twig, 'bem', array( $this, 'bem' ) );
		$this->register_function( $twig, 'breadcrumbs', array( $this, 'breadcrumbs' ) );
		$this->register_function( $twig, 'get_icon', array( $this, 'get_icon' ) );
		$this->register_function( $twig, 'should_use_icons_module', array( $this, 'should_use_icons_module' ) );

		do_action( 'chisel_twig_register_functions', $twig, $this );

		return $twig;
	}

	/**
	 * Register custom Twig filters.
	 *
	 * @param \Twig\Environment $twig The Twig environment.
	 * @return \Twig\Environment
	 */
	public function register_filters( \Twig\Environment $twig ): \Twig\Environment {
		do_action( 'chisel_twig_register_filters', $twig, $this );

		return $twig;
	}

	/**
	 * Register custom Twig tests.
	 *
	 * @param \Twig\Environment $twig The Twig environment.
	 * @return \Twig\Environment
	 */
	public function register_tests( \Twig\Environment $twig ): \Twig\Environment {
		do_action( 'chisel_twig_register_tests', $twig, $this );

		return $twig;
	}

	/**
	 * Register a Twig function.
	 *
	 * @param   \Twig\Environment $twig The Twig environment.
	 * @param   string            $name The name of the function.
	 * @param   callable          $callback The callback function.
	 *
	 * @return \Twig\Environment
	 */
	public function register_function( \Twig\Environment $twig, string $name, callable $callback ): \Twig\Environment {
		$twig->addFunction( new \Twig\TwigFunction( $name, $callback ) );

		return $twig;
	}

	/**
	 * Register a Twig filter.
	 *
	 * @param   \Twig\Environment $twig The Twig environment.
	 * @param   string            $name The name of the function.
	 * @param   callable          $callback The callback function.
	 *
	 * @return \Twig\Environment
	 */
	public function register_filter( \Twig\Environment $twig, string $name, callable $callback ): \Twig\Environment {
		$twig->addFilter( new \Twig\TwigFilter( $name, $callback ) );

		return $twig;
	}

	/**
	 * Register a Twig test.
	 *
	 * @param   \Twig\Environment $twig The Twig environment.
	 * @param   string            $name The name of the function.
	 * @param   callable          $callback The callback function.
	 *
	 * @return \Twig\Environment
	 */
	public function register_test( \Twig\Environment $twig, string $name, callable $callback ): \Twig\Environment {
		$twig->addTest( new \Twig\TwigTest( $name, $callback ) );

		return $twig;
	}

	/**
	 * Get the navigation menu.
	 *
	 * @param string $menu_name The menu name.
	 * @return mixed - The menu object or empty string
	 */
	public function get_nav_menu( string $menu_name ): mixed {
		$context = Timber::context();

		return $context['menus'][$menu_name] ?? '';
	}

	/**
	 * Set the product object.
	 *
	 * @param object $post The post object.
	 */
	public function timber_set_product( object $post ): void {
		WoocommerceHelpers::timber_set_product( $post );
	}

	/**
	 * Prepare post classnames to follow ITCSS structure.
	 *
	 * @param ?string $classes The post classes.
	 * @param string  $prefix The prefix e.g. c-post--.
	 *
	 * @return string
	 */
	public function post_classes( ?string $classes, string $prefix = 'c-post' ): string {
		if ( empty( $classes ) ) {
			return '';
		}

		$classnames = explode( ' ', $classes );

		return ThemeHelpers::bem( $prefix, ...$classnames );
	}

	/**
	 * Prepare slider params for data attributes
	 *
	 * @param array $params
	 *
	 * @return array
	 */
	public function slider_prepare_params( array $params ): array {
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
					$value = DataHelpers::json_encode_for_data_attribute( $param_value );
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
	 * @param array  $attrs Image attributes.
	 *
	 * @return string
	 */
	public function get_responsive_image( int $image_id, string $image_size = 'medium', array $attrs = array() ): string {
		return ImageHelpers::get_responsive_image( $image_id, $image_size, $attrs );
	}

	/**
	 * Display comments template - the comments and the form.
	 *
	 * @return string
	 */
	public function comments_template(): string {
		return CommentsHelpers::comments_template();
	}

	/**
	 * Generate BEM class names with modifiers
	 *
	 * @param string $name
	 * @param mixed  ...$modifiers
	 *
	 * @return string
	 */
	public function bem( string $name = '', mixed ...$modifiers ): string {
		return ThemeHelpers::bem( $name, ...$modifiers );
	}

	/**
	 * Display breadcrumbs. Requires Yoast plugin.
	 *
	 * @return string
	 */
	public function breadcrumbs(): string {
		return YoastHelpers::breadcrumbs();
	}

	/**
	 * Get svg icon. The arguments are described in objects/icon.twig file
	 *
	 * @param array $args
	 *
	 * @return string
	 */
	public function get_icon( array $args ): string {
		return Components::get_icon( $args );
	}

	/**
	 * Check if icons module should be used
	 *
	 * @return bool
	 */
	public function should_use_icons_module(): bool {
		return ThemeHelpers::should_use_icons_module();
	}
}
