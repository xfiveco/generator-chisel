<?php

namespace Chisel\WP;

use Chisel\Traits\HooksSingleton;
use Chisel\Helpers\ThemeHelpers;

/**
 * WordPress Theme setup related functionality.
 *
 * @package Chisel
 */
final class Theme {

	use HooksSingleton;

	/**
	 * Post types that support post thumbnails.
	 *
	 * @var array
	 */
	private array $post_thumbnails_post_types = array( 'post' );

	/**
	 * Navigation menus.
	 *
	 * @var array
	 */
	private array $nav_menus = array();

	/**
	 * Set properties.
	 */
	public function set_properties(): void {
		// Set nav menus to register.
		$this->nav_menus = array(
			'chisel_main_nav'   => __( 'Main Navigation', 'chisel' ),
			'chisel_footer_nav' => __( 'Footer Navigation', 'chisel' ),
		);
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'init', array( $this, 'theme_supports' ), 11 );
		add_action( 'after_setup_theme', array( $this, 'remove_post_supports' ), 99 );
		add_action( 'init', array( $this, 'register_nav_menus' ) );
		add_action( 'after_setup_theme', array( $this, 'i18n' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'body_class', array( $this, 'body_classes' ) );
		add_filter( 'tiny_mce_before_init', array( $this, 'mce_custom_colors' ) );
		add_filter( 'login_headertext', array( $this, 'login_headertext' ) );
		add_filter( 'login_headerurl', array( $this, 'login_headerurl' ) );
		add_filter( 'wp_revisions_to_keep', array( $this, 'wp_revisions_to_keep' ), 99, 2 );
		add_filter( 'heartbeat_settings', array( $this, 'heartbeat_settings' ) );
		add_filter( 'jpeg_quality', array( $this, 'jpeg_quality' ) );

		// Disable legacy support for XML-RPC.
		add_filter( 'xmlrpc_enabled', '__return_false' );
	}

	/**
	 * Add theme supports.
	 */
	public function theme_supports(): void {
		$this->post_thumbnails_post_types = (array) apply_filters( 'chisel_post_thumbnails_post_types', $this->post_thumbnails_post_types );

		add_theme_support( 'title-tag' );
		add_theme_support( 'post-formats', array() );
		add_theme_support( 'post-thumbnails', $this->post_thumbnails_post_types );
		add_theme_support( 'menus' );
		add_theme_support( 'widgets' );

		add_theme_support(
			'custom-logo',
			array(
				'height'               => 100,
				'width'                => 400,
				'flex-height'          => true,
				'flex-width'           => true,
				'header-text'          => array( 'site-title', 'site-description' ),
				'unlink-homepage-logo' => false,
			)
		);

		add_theme_support(
			'html5',
			array(
				'search-form',
				'comment-form',
				'comment-list',
				'gallery',
				'caption',
			)
		);

		add_theme_support( 'responsive-embeds' ); // adds ratio class and styles to embeds.
	}

	/**
	 * Remove post supports.
	 */
	public function remove_post_supports(): void {
		remove_post_type_support( 'page', 'excerpt' );
		remove_post_type_support( 'attachment', 'comments' );
	}

	/**
	 * Register navigation menus.
	 */
	public function register_nav_menus(): void {
		$this->nav_menus = (array) apply_filters( 'chisel_nav_menus', $this->nav_menus );

		register_nav_menus( $this->nav_menus );
	}

	/**
	 * Load theme internationalization files.
	 */
	public function i18n(): void {
		// Load user's custom translations from wp-content/languages/ folder.
		load_textdomain(
			'chisel',
			sprintf(
				'%s/%s-%s.mo',
				WP_LANG_DIR,
				get_template(),
				get_locale()
			),
		);

		// Load theme's available translations.
		load_theme_textdomain(
			'chisel',
			sprintf(
				'%s/languages',
				get_template_directory()
			)
		);
	}

	/**
	 * Add custom classes to the body tag.
	 *
	 * @param array $classes
	 *
	 * @return array
	 */
	public function body_classes( array $classes ): array {
		$classes[] = 'chisel-theme';

		return $classes;
	}

	/**
	 * This function will add custom colors pallette to tinymce editor
	 *
	 * @param array $settings
	 *
	 * @return array
	 */
	public function mce_custom_colors( array $settings ): array {
		$default_colors = '
			"000000", "Black",
			"993300", "Burnt orange",
			"333300", "Dark olive",
			"003300", "Dark green",
			"003366", "Dark azure",
			"000080", "Navy Blue",
			"333399", "Indigo",
			"333333", "Very dark gray",
			"800000", "Maroon",
			"FF6600", "Orange",
			"808000", "Olive",
			"008000", "Green",
			"008080", "Teal",
			"0000FF", "Blue",
			"666699", "Grayish blue",
			"808080", "Gray",
			"FF0000", "Red",
			"FF9900", "Amber",
			"99CC00", "Yellow green",
			"339966", "Sea green",
			"33CCCC", "Turquoise",
			"3366FF", "Royal blue",
			"800080", "Purple",
			"999999", "Medium gray",
			"FF00FF", "Magenta",
			"FFCC00", "Gold",
			"FFFF00", "Yellow",
			"00FF00", "Lime",
			"00FFFF", "Aqua",
			"00CCFF", "Sky blue",
			"993366", "Brown",
			"C0C0C0", "Silver",
			"FF99CC", "Pink",
			"FFCC99", "Peach",
			"FFFF99", "Light yellow",
			"CCFFCC", "Pale green",
			"CCFFFF", "Pale cyan",
			"99CCFF", "Light sky blue",
			"CC99FF", "Plum",
			"FFFFFF", "White"
		';

		$custom_colors = ThemeHelpers::get_colors_palette( 'tinymce' );

		$settings['textcolor_map']  = '[' . $default_colors . ',' . $custom_colors . ']';
		$settings['textcolor_rows'] = 7; // expand colour grid to 7 rows.

		return $settings;
	}

	/**
	 * Add custom login page logo text.
	 *
	 * @param string $text
	 *
	 * @return string
	 */
	public function login_headertext( string $text ): string {
		$text = esc_attr( get_bloginfo( 'name' ) );

		return $text;
	}

	/**
	 * Add custom login page logo url.
	 *
	 * @param string $url
	 *
	 * @return string
	 */
	public function login_headerurl( string $url ): string {
		$url = esc_url( get_bloginfo( 'url' ) );

		return $url;
	}

	/**
	 * Set the limit of revisions to keep.
	 *
	 * @param int      $num
	 * @param \WP_Post $post
	 *
	 * @return int
	 */
	public function wp_revisions_to_keep( int $num, \WP_Post $post ): int {
		return 10;
	}

	/**
	 * Increase the heartbeat interval from default 15 to 30 seconds.
	 *
	 * @param array $settings
	 *
	 * @return array
	 */
	public function heartbeat_settings( array $settings ): array {
		$settings['interval'] = 30;

		return $settings;
	}

	/**
	 * Set JPEG quality to 90%
	 *
	 * @param int $quality
	 *
	 * @return int
	 */
	public function jpeg_quality( int $quality ): int {
		return 90;
	}
}
