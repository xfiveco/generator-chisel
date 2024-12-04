<?php

namespace Chisel\WP;

use Timber\Timber;
use Chisel\Helper\ImageHelpers;
use Chisel\Helper\AcfHelpers;

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
	private static $menus = array();

	/**
	 * The logo.
	 *
	 * @var array
	 */
	private static $logo = array();

	/**
	 * The sidebar widgets.
	 *
	 * @var array
	 */
	private static $sidebar = array();

	/**
	 * The footer sidebars.
	 *
	 * @var array
	 */
	private static $footer_sidebars = array();

	/**
	 * The page / post title.
	 *
	 * @var array
	 */
	private static $the_title = array();

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
		if ( self::$logo ) {
			return self::$logo;
		}

		$logo_id = get_theme_mod( 'custom_logo', 0 );

		if ( $logo_id ) {
			self::$logo = ImageHelpers::get_responsive_image( $logo_id );
		}

		return self::$logo;
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
	 * Get the current page title.
	 *
	 * @return array
	 */
	public static function get_the_title() {
		if ( self::$the_title ) {
			return self::$the_title;
		}

		$classname   = 'c-title';
		$the_title   = array();
		$title_text  = '';
		$title_class = '';

		if ( is_singular() ) {
			global $post;

			if ( isset( $post->ID ) ) {
				$display_title = AcfHelpers::get_field( 'page_title_display', $post->ID ) ?: 'show';

				if ( $display_title !== 'hide' ) {
					$title_text  = get_the_title( $post->ID );
					$sr_only     = $display_title === 'hide-visually' ? 'u-sr-only' : '';
					$title_class = sprintf( '%s %s', $classname, $sr_only );
				}
			}
		} elseif ( is_home() ) {
			$posts_page_id = absint( get_option( 'page_for_posts' ) );

			if ( $posts_page_id ) {
				$title_text = get_the_title( $posts_page_id );
			}
		} elseif ( is_author() ) {
			$author     = Timber::get_user( get_queried_object_id() );
			$title_text = __( 'Author: ', 'chisel' ) . $author->name;
		} elseif ( is_day() ) {
			$title_text = __( 'Date archive: ', 'chisel' ) . ' ' . get_the_date( 'D M Y' );
		} elseif ( is_month() ) {
			$title_text = __( 'Date archive: ', 'chisel' ) . ' ' . get_the_date( 'M Y' );
		} elseif ( is_year() ) {
			$title_text = __( 'Date archive: ', 'chisel' ) . ' ' . get_the_date( 'Y' );
		} elseif ( is_tag() ) {
			$title_text = __( 'Tag: ', 'chisel' ) . ' ' . single_tag_title( '', false );
		} elseif ( is_category() ) {
			$title_text = __( 'Category: ', 'chisel' ) . ' ' . single_cat_title( '', false );
		} elseif ( is_post_type_archive() ) {
			$title_text = post_type_archive_title( '', false );
		} elseif ( is_tax() ) {
			$title_text = single_term_title( '', false );
		} elseif ( is_search() ) {
			$title_text = __( 'Search results for: ', 'chisel' ) . ' ' . get_search_query();
		} elseif ( is_404() ) {
			$title_text = __( '404 - Page not found', 'chisel' );
		}

		if ( $title_text ) {
			self::$the_title = array(
				'text'  => esc_html( $title_text ),
				'class' => $title_class ? esc_attr( $title_class ) : $classname,
			);
		}

		return self::$the_title;
	}
}
