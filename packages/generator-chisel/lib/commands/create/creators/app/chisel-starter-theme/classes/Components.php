<?php

namespace Chisel;

use Timber\Timber;
use Chisel\ChiselCache;

/**
 * Use this class to get site components.
 *
 * @package Chisel
 */
class Components {

	/**
	 * The site nav menus.
	 *
	 * @var array
	 */
	protected static $menus = array();

	/**
	 * The logo image html.
	 *
	 * @var html
	 */
	protected static $logo_image = '';

	/**
	 * The sidebar widgets.
	 *
	 * @var array
	 */
	protected static $sidebar = array();

	/**
	 * The footer sidebars.
	 *
	 * @var array
	 */
	protected static $footer_sidebars = array();

	/**
	 * The page / post title.
	 *
	 * @var string|html
	 */
	protected static $the_title = null;

	/**
	 * Get the site nav menus.
	 *
	 * @return array
	 */
	public static function get_menus() {
		if ( ! self::$menus ) {
			foreach ( array_keys( get_registered_nav_menus() ) as $menu ) {
				if ( strpos( $menu, 'chisel', 0 ) === false ) {
					continue;
				}

				$menu_name = str_replace( 'chisel_', '', $menu );

				if ( ! has_nav_menu( $menu ) ) {
					$menus[$menu_name] = '';

					continue;
				}

				$menus[$menu_name] = Timber::get_menu( $menu );
			}
		}

		return $menus;
	}

	/**
	 * Get the site logo.
	 *
	 * @return string
	 */
	public static function get_logo() {
		$context = Timber::context();

		if ( ! self::$logo_image ) {
			$logo_id = get_theme_mod( 'custom_logo', 0 );

			if ( $logo_id ) {
				self::$logo_image = Timber::get_image( $logo_id )->responsive();
			}

			$context['logo_image'] = self::$logo_image;
		}

		return Timber::compile(
			'partials/logo.twig',
			$context,
			ChiselCache::expiry( DAY_IN_SECONDS )
		);
	}

	/**
	 * Get the sidebar.
	 *
	 * @param string $sidebar_id The sidebar id.
	 *
	 * @return array
	 */
	public static function get_sidebar( $sidebar_id = false ) {
		if ( self::$sidebar ) {
			return self::$sidebar;
		}

		if ( $sidebar_id ) {
			self::$sidebar = Timber::get_widgets( 'chisel-sidebar-' . $sidebar_id );
			return self::$sidebar;
		}

		if ( is_singular( 'post' ) ) {
			self::$sidebar = Timber::get_widgets( 'chisel-sidebar-blog' );
		}

		if ( function_exists( 'is_shop' ) && is_shop() ) {
			self::$sidebar = Timber::get_widgets( 'chisel-sidebar-woocommerce' );
		}

		return self::$sidebar;
	}

	/**
	 * Get the footer sidebars.
	 *
	 * @return array
	 */
	public static function get_footer_sidebars() {
		if ( self::$footer_sidebars ) {
			return self::$footer_sidebars;
		}

		self::$footer_sidebars = array(
			'columns' => array(),
		);

		$column_class = '';

		for ( $i = 1; $i <= 4; $i++ ) {
			$footer_widgets = Timber::get_widgets( 'chisel-sidebar-footer-' . $i );

			if ( $footer_widgets ) {
				self::$footer_sidebars['columns'][] = $footer_widgets;
			}
		}

		switch ( count( self::$footer_sidebars['columns'] ) ) {
			case 4:
				$column_class = 'o-layout__item--3-large';
				break;
			case 3:
				$column_class = 'o-layout__item--4-large';
				break;
			case 2:
				$column_class = 'o-layout__item--6-large';
				break;
			default:
				$column_class = 'o-layout__item--12';
				break;
		}

		self::$footer_sidebars['column_class'] = $column_class;

		return self::$footer_sidebars;
	}

	/**
	 * Get the page or post title html based on the acf field value.
	 *
	 * @param int $post_id
	 *
	 * @return string|html
	 */
	public static function get_the_title( $post_id ) {
		$context = Timber::context();

		if ( self::$the_title === null ) {
			$display = Acf::get_field( 'page_title_display', $post_id ) ?: 'show';

			if ( $display === 'hide' ) {
				self::$the_title = array();
			} else {
				$title   = get_the_title( $post_id );
				$sr_only = $display === 'hide-visually' ? 'u-sr-only' : '';

				self::$the_title = array(
					'class' => sprintf( 'c-title %s', $sr_only ),
					'text'  => esc_html( $title ),
				);
			}
		}

		$context['the_title'] = apply_filters( 'chisel_the_title', self::$the_title, $post_id );

		return Timber::compile(
			'partials/the-title.twig',
			$context,
			ChiselCache::expiry()
		);
	}
}
