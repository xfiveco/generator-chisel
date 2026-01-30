<?php

namespace Chisel\Helpers;

/**
 * Helper functions.
 *
 * @package Chisel
 */
final class WoocommerceHelpers {
	/**
	 * Prevent instantiation.
	 */
	private function __construct() {}

	/**
	 * Check if WooCommerce is active.
	 *
	 * @return bool
	 */
	public static function is_woocommerce_active(): bool {
		return class_exists( '\Woocommerce' );
	}

	/**
	 * Set the product object. For some reason, products in the loop don’t get the right context by default. Without this, some elements of the listed products would show the same information as the first product in the loop. This function fixes that.
	 *
	 * @param object $post
	 *
	 * @return void
	 */
	public static function timber_set_product( object $post ): void {
		if ( ! self::is_woocommerce_active() ) {
			return;
		}

		if ( $post->post_type === 'product' ) {
			global $product;

			$product = wc_get_product( $post->ID );
		}
	}

	/**
	 * Get products grid classnames
	 *
	 * @param bool $products - Whether there are products to render.
	 * @param bool $has_sidebar -Whether the layout includes a sidebar.
	 *
	 * @return string
	 */
	public static function get_products_grid_classnames( bool $products, bool $has_sidebar ): string {
		$loop_columns = (int) wc_get_loop_prop( 'columns' );

		// Set max columns to 4.
		if ( $loop_columns > 4 ) {
			$loop_columns = 4;
		}

		$columns_data = array(
			'medium' => $loop_columns,
			'small'  => $loop_columns > 2 ? $loop_columns - 1 : $loop_columns,
		);

		$grid_classnames = array(
			'o-grid',
			'o-grid--cols-1',
		);

		if ( $products ) {
			$grid_classnames[] = 'o-grid--cols-' . $columns_data['small'] . '-small';

			if ( $has_sidebar ) {
				$grid_classnames[] = 'o-grid--cols-' . $columns_data['small'] . '-medium';
			} else {
				$grid_classnames[] = 'o-grid--cols-' . $columns_data['medium'] . '-medium';
			}
		}

		return implode( ' ', $grid_classnames );
	}
}
