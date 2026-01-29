<?php

namespace Chisel\Plugins\Woocommerce;

use Chisel\Traits\HooksSingleton;

use Chisel\Helpers\WoocommerceHelpers;

/**
 * Class used to extend Timber functionality.
 *
 * @package Chisel
 */
class Woocommerce {
	use HooksSingleton;

	/**
	 * Woocommerce sidebars.
	 *
	 * @var string
	 */
	private $sidebars = array();

	/**
	 * Initialize.
	 */
	public function init(): bool {
		if ( ! WoocommerceHelpers::is_woocommerce_active() ) {
			return false;
		}

		return true;
	}

	/**
	 * Set properties.
	 */
	public function set_properties(): void {
		$this->sidebars = array(
			'woocommerce' => array(
				'name'        => __( 'Woocommerce', 'chisel' ),
				'description' => __( 'Sidebar for shop pages', 'chisel' ),
			),
		);
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		$this->remove_actions();

		add_action( 'rest_api_init', array( $this, 'register_cart' ) );

		add_action( 'after_setup_theme', array( $this, 'add_woocommerce_support' ) );

		add_action( 'woocommerce_before_shop_loop', array( $this, 'before_shop_loop_div_open' ), 19 );
		add_action( 'woocommerce_before_shop_loop', array( $this, 'before_shop_loop_div_close' ), 31 );

		add_action( 'customize_register', array( $this, 'modify_customizer' ), 20 );

		add_action( 'pre_get_posts', array( $this, 'pre_get_posts' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'chisel_sidebars', array( $this, 'register_sidebars' ) );
		add_filter( 'woocommerce_enqueue_styles', array( $this, 'enqueue_styles' ) );
		add_filter( 'chisel_frontend_styles', array( $this, 'register_custom_styles' ) );
		add_filter( 'woocommerce_template_loader_files', array( $this, 'woocommerce_template_loader_files' ), 99 );
	}

	/**
	 * Remove WooCommerce actions.
	 */
	public function remove_actions() {
		// Remove loop product link open and close, so we can use our own.
		remove_action( 'woocommerce_before_shop_loop_item', 'woocommerce_template_loop_product_link_open', 10 );
		remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_product_link_close', 5 );

		// Remove loop category link open and close, so we can use our own.
		remove_action( 'woocommerce_before_subcategory', 'woocommerce_template_loop_category_link_open', 10 );
		remove_action( 'woocommerce_after_subcategory', 'woocommerce_template_loop_category_link_close', 10 );
		// Remove category default thumbnail.
		remove_action( 'woocommerce_before_subcategory_title', 'woocommerce_subcategory_thumbnail', 10 );

		remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
		remove_action( 'woocommerce_after_main_content', 'woocommerce_output_content_wrapper_end', 10 );
		remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );

		// Remove product default thumbnail.
		remove_action( 'woocommerce_before_shop_loop_item_title', 'woocommerce_template_loop_product_thumbnail' );

		remove_action( 'woocommerce_after_shop_loop', 'woocommerce_pagination', 10 );

		remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_upsell_display', 15 );
		remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_output_related_products', 20 );
	}

	/**
	 * Get access to cart in REST API endpoints.
	 *
	 * @return void
	 */
	public function register_cart(): void {
		include_once WC_ABSPATH . 'includes/wc-cart-functions.php';
		include_once WC_ABSPATH . 'includes/wc-notice-functions.php';

		WC()->initialize_session();
		WC()->initialize_cart();
		WC()->session->set_customer_session_cookie( true );

		WC()->cart->get_cart();
	}

	/**
	 * Add WooCommerce support.
	 */
	public function add_woocommerce_support(): void {
		add_theme_support( 'woocommerce' );
		add_theme_support( 'wc-product-gallery-zoom' );
		add_theme_support( 'wc-product-gallery-lightbox' );
		add_theme_support( 'wc-product-gallery-slider' );
	}

	/**
	 * Open container for sort bar.
	 */
	public function before_shop_loop_div_open(): void {
		echo '<div class="c-shop__sort"> ';
	}

	/**
	 * Close container for sort bar.
	 */
	public function before_shop_loop_div_close(): void {
		echo ' </div> ';
	}

	/**
	 * Modify woocommerce customizer settings.
	 *
	 * @param \WP_Customize_Manager $wp_customize
	 *
	 * @return void
	 */
	public function modify_customizer( \WP_Customize_Manager $wp_customize ): void {
		$shop_page_display_control     = $wp_customize->get_control( 'woocommerce_shop_page_display' );
		$category_page_display_control = $wp_customize->get_control( 'woocommerce_category_archive_display' );

		if ( $shop_page_display_control && isset( $shop_page_display_control->choices ) ) {
				unset( $shop_page_display_control->choices['both'] );
		}

		if ( $category_page_display_control && isset( $category_page_display_control->choices ) ) {
				unset( $category_page_display_control->choices['both'] );
		}
	}

	/**
	 * Set woocommerce query to get orderby setting from customizer so that is consistent with ajax queries.
	 *
	 * @param \WP_Query $query
	 *
	 * @return void
	 */
	public function pre_get_posts( \WP_Query $query ): void {
		if ( ! is_admin() && $query->is_main_query() && ( is_shop() || is_product_category() || is_product_tag() ) ) {
			$query->set( 'orderby', get_option( 'woocommerce_default_catalog_orderby', 'menu_order' ) );
		}
	}

	/**
	 * Register woocommerce sidebars.
	 *
	 * @param array $sidebars
	 *
	 * @return array
	 */
	public function register_sidebars( array $sidebars ): array {
		$sidebars = array_merge( $sidebars, $this->sidebars );

		return $sidebars;
	}

	/**
	 * Modify woocommerce enqueued styles.
	 *
	 * @param array $enqueue_styles
	 *
	 * @return array
	 */
	public function enqueue_styles( array $enqueue_styles ): array {
		unset( $enqueue_styles['woocommerce-layout'] );

		return $enqueue_styles;
	}


	/**
	 * Register custom styles.
	 *
	 * @param array $styles
	 *
	 * @return array
	 */
	public function register_custom_styles( array $styles ): array {
		$styles['woocommerce'] = array();

		return $styles;
	}

	/**
	 * Add custom woocommerce template loader files. Lets us override default templates.
	 *
	 * @param array $files
	 *
	 * @return array
	 */
	public function woocommerce_template_loader_files( array $files ): array {
		$files[] = 'custom/woocommerce.php';

		return $files;
	}
}
