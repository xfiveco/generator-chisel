<?php

namespace Chisel\Helper;

/**
 * Helper functions.
 *
 * @package Chisel
 */
class WoocommerceHelpers {

	/**
	 * Check if WooCommerce is active.
	 *
	 * @return bool
	 */
	public static function is_woocommerce_active() {
		return class_exists( '\Woocommerce' );
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
	 * Get products grid classnames
	 *
	 * @param bool $products
	 * @param bool $has_sidebar
	 *
	 * @return string
	 */
	public static function get_products_grid_classnames( $products, $has_sidebar ) {
		$loop_columns = wc_get_loop_prop( 'columns' );

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
