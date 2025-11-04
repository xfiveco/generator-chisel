<?php
/**
 * The Template for displaying woocommerce pages.
 *
 * @package Chisel
 */

use Timber\Timber;
use Chisel\Helpers\CacheHelpers;
use Chisel\Helpers\WoocommerceHelpers;

$context = Timber::context();

if ( is_singular( 'product' ) ) {
	$context['post']    = Timber::get_post();
	$context['product'] = wc_get_product( $context['post']->ID );

	// Get upsells ids.
	$upsells_ids = apply_filters( 'chisel_woocommerce_upsell_display', true ) ? $context['product']->get_upsell_ids() : array();

	// Get related / crossells products ids.
	$related_limit = wc_get_loop_prop( 'columns' );
	$related_ids   = apply_filters( 'chisel_woocommerce_output_related_products', true ) ? wc_get_related_products( $context['post']->id, $related_limit, $upsells_ids ) : array();

	$context['upsells_products'] = $upsells_ids ? Timber::get_posts( $upsells_ids ) : array();
	$context['related_products'] = $related_ids ? Timber::get_posts( $related_ids ) : array();
	$context['wrapper_class']    = 'c-product';
	$context['grid_classnames']  = WoocommerceHelpers::get_products_grid_classnames( true, false );

	// Restore the context and loop back to the main query loop.
	wp_reset_postdata();

	Timber::render( 'woocommerce/single-product.twig', $context, CacheHelpers::expiry() );
} else {
	$display_type  = woocommerce_get_loop_display_mode();
	$show_products = true;
	$categories    = array();

	if ( $display_type === 'subcategories' ) {
		$categories = woocommerce_get_product_subcategories( is_product_category() ? get_queried_object_id() : 0 );

		$show_products = empty( $categories );
	}

	if ( $show_products ) {
		$items = Timber::get_posts();
	} else {
		$items = array_map( 'Timber::get_term', $categories );
	}

	$has_sidebar  = isset( $context['sidebar']['content'] ) && ! empty( $context['sidebar']['content'] );
	$loop_columns = wc_get_loop_prop( 'columns' );
	$loop_rows    = wc_get_default_product_rows_per_page();

	$grid_classnames = WoocommerceHelpers::get_products_grid_classnames( true, $has_sidebar );

	$context['show_products']      = $show_products;
	$context['items']              = $items;
	$context['categories']         = $categories;
	$context['loop_columns_class'] = $grid_classnames;
	$context['load_more']          = array(
		'per_page'  => absint( $loop_columns * $loop_rows ),
		'post_type' => 'product',
	);

	Timber::render( 'woocommerce/archive-product.twig', $context, CacheHelpers::expiry() );
}
