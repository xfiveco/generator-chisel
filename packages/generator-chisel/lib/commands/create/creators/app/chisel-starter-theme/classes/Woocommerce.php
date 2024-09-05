<?php
//phpcs:disable
namespace Chisel;

/**
 * Class used to extend Timber functionality.
 *
 * @package Chisel
 */
class Woocommerce implements Instance {

	/**
	 * Class constructor.
	 */
	private function __construct() {
		if ( ! self::is_woocommerce_active() ) {
			return;
		}

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
		$this->remove_actions();

		add_action( 'after_setup_theme', array( $this, 'add_woocommerce_support' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
		add_filter( 'woocommerce_enqueue_styles', array( $this, 'enqueue_styles' ) );
	}

	/**
	 * Remove WooCommerce actions.
	 */
	public function remove_actions() {
		// Remove loop product link open and close, so we can use our own.
		remove_action( 'woocommerce_before_shop_loop_item', 'woocommerce_template_loop_product_link_open', 10 );
		remove_action( 'woocommerce_after_shop_loop_item', 'woocommerce_template_loop_product_link_close', 5 );

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
	 * Add WooCommerce support.
	 */
	public function add_woocommerce_support() {
		add_theme_support( 'woocommerce' );
		add_theme_support( 'wc-product-gallery-zoom' );
		add_theme_support( 'wc-product-gallery-lightbox' );
		add_theme_support( 'wc-product-gallery-slider' );
	}

	/**
	 * Modify woocommerce enqueued styles.
	 *
	 * @param array $enqueue_styles
	 *
	 * @return array
	*/
	public function enqueue_styles( $enqueue_styles ) {
		unset( $enqueue_styles['woocommerce-layout'] );

		return $enqueue_styles;
	}

	/**
	 * Set the product object. For some reason, products in the loop don’t get the right context by default. Without this, some elements of the listed products would show the same information as the first product in the loop. This function fixes that.
	 *
	 * @param object $post The post object.
	 */
	public static function timber_set_product( $post ) {
		global $product;

		if ( is_woocommerce() ) {
			$product = wc_get_product( $post->ID );
		}
	}

	/**
	 * Check if WooCommerce is active.
	 *
	 * @return bool
	 */
	public static function is_woocommerce_active() {
		return class_exists( '\Woocommerce' );
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
