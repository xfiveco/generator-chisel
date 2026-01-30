<?php

namespace Chisel\Timber;

use Timber\Timber;
use Chisel\Helpers\ImageHelpers;
use Chisel\Helpers\AcfHelpers;
use Chisel\Helpers\CacheHelpers;

/**
 * Use this class to get site components.
 *
 * @package Chisel
 */
final class Components {

	/**
	 * The site nav menus.
	 *
	 * @var array
	 */
	private static array $menus = array();

	/**
	 * The logo.
	 *
	 * @var string
	 */
	private static string $logo = '';

	/**
	 * The sidebar widgets.
	 *
	 * @var array
	 */
	private static array $sidebar = array();

	/**
	 * The footer sidebars.
	 *
	 * @var array
	 */
	private static array $footer_sidebars = array();

	/**
	 * The page / post title.
	 *
	 * @var array
	 */
	private static array $the_title = array();

	/**
	 * The svg icons.
	 *
	 * @var array
	 */
	private static array $icons = array();

	/**
	 * Get the site nav menus.
	 *
	 * @return array
	 */
	public static function get_menus(): array {
		if ( empty( self::$menus ) ) {
			$nav_menus = get_registered_nav_menus();

			foreach ( array_keys( $nav_menus ) as $menu ) {
				if ( strpos( $menu, 'chisel', 0 ) === false ) {
					continue;
				}

				$menu_name         = str_replace( 'chisel_', '', $menu );
				$menus[$menu_name] = has_nav_menu( $menu ) ? Timber::get_menu( $menu ) : '';
			}
		}

		return $menus;
	}

	/**
	 * Get the site logo.
	 *
	 * @return string
	 */
	public static function get_logo(): string {
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
	 * @return ?array
	 */
	public static function get_sidebar( string $sidebar_id = '' ): ?array {
		$sidebar_name = null;

		if ( $sidebar_id ) {
			$sidebar_name = 'chisel-sidebar-' . $sidebar_id;
		} elseif ( is_singular( 'post' ) ) {
			$sidebar_name = 'chisel-sidebar-blog';
		} elseif ( function_exists( 'is_shop' ) && ( is_shop() || is_product_category() || is_product_tag() ) ) {
			$sidebar_name = 'chisel-sidebar-woocommerce';
		}

		if ( ! $sidebar_name ) {
			return null;
		}

		if ( isset( self::$sidebar[ $sidebar_name ] ) ) {
			return self::$sidebar[ $sidebar_name ];
		}

		$sidebar_content = apply_filters( 'chisel_sidebar_content', Timber::get_widgets( $sidebar_name ), $sidebar_name );

		self::$sidebar[ $sidebar_name ] = array(
			'id'      => $sidebar_id,
			'name'    => $sidebar_name,
			'content' => $sidebar_content,
		);

		return self::$sidebar[ $sidebar_name ];
	}

	/**
	 * Get the footer sidebars.
	 *
	 * @return array
	 */
	public static function get_footer_sidebars(): array {
		if ( ! empty( self::$footer_sidebars ) ) {
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

		$column_count = count( self::$footer_sidebars['columns'] );

		$column_class = match ( $column_count ) {
			4 => 'o-layout__item--3-large',
			3 => 'o-layout__item--4-large',
			2 => 'o-layout__item--6-large',
			default => 'o-layout__item--12',
		};

		self::$footer_sidebars['column_class'] = $column_class;

		return self::$footer_sidebars;
	}

	/**
	 * Get the current page title data.
	 *
	 * @return array
	 */
	public static function get_the_title(): array {
		if ( ! empty( self::$the_title ) ) {
			return self::$the_title;
		}

		$classname   = 'c-title';
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
			$posts_page_id = (int) get_option( 'page_for_posts' );

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

		if ( $title_text !== '' ) {
			self::$the_title = array(
				'text'  => esc_html( $title_text ),
				'class' => $title_class ? esc_attr( $title_class ) : $classname,
			);
		}

		return self::$the_title;
	}

	/**
	 * Get svg icon. The arguments are described in objects/icon.twig file
	 *
	 * @param array $args
	 *
	 * @return string
	 */
	public static function get_icon( array $args ): string {
		$icon_slug = sanitize_title( $args['name'] );
		$icon_key  = '';

		foreach ( $args as $key => $value ) {
			if ( is_bool( $value ) ) {
				$value = $value ? 'yes' : 'no';
			}

			$icon_key .= sanitize_title( $key . $value );
		}

		if ( isset( self::$icons[$icon_key] ) ) {
			return self::$icons[$icon_key];
		}

		self::$icons[$icon_key] = Timber::compile( 'objects/icon.twig', $args, CacheHelpers::expiry() );

		return self::$icons[$icon_key];
	}
}
