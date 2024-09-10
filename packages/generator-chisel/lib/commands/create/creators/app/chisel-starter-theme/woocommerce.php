<?php
/**
 * The Template for displaying woocommerce pages.
 *
 * @package Chisel
 */

use Chisel\ChiselCache;
use Chisel\Woocommerce;
use Timber\Timber;

$context = Timber::context();

if ( is_singular( 'product' ) ) {
	$context['post']    = Timber::get_post();
	$context['product'] = wc_get_product( $context['post']->ID );

	// Get upsells ids.
	$upsells_ids = $context['product']->get_upsell_ids();

	// Get related / crossells products ids.
	$related_limit = wc_get_loop_prop( 'columns' );
	$related_ids   = wc_get_related_products( $context['post']->id, $related_limit, $upsells_ids );

	$context['upsells_products'] = $upsells_ids ? Timber::get_posts( $upsells_ids ) : array();
	$context['related_products'] = $related_ids ? Timber::get_posts( $related_ids ) : array();
	$context['wrapper_class']    = 'c-product';
	$context['grid_classnames']  = Woocommerce::get_products_grid_classnames( true, false );

	// Restore the context and loop back to the main query loop.
	wp_reset_postdata();

	Timber::render( 'woocommerce/single-product.twig', $context, ChiselCache::expiry() );
} else {
	$products     = Timber::get_posts();
	$has_sidebar  = ! empty( $context['sidebar'] );
	$loop_columns = wc_get_loop_prop( 'columns' );
	$loop_rows    = wc_get_default_product_rows_per_page();

	$grid_classnames = Woocommerce::get_products_grid_classnames( $products, $has_sidebar );

	$context['products']           = $products;
	$context['loop_columns_class'] = $grid_classnames;
	$context['load_more']          = array(
		'per_page'  => absint( $loop_columns * $loop_rows ),
		'post_type' => 'product',
	);

	if ( is_product_category() ) {
		$queried_object      = get_queried_object();
		$term_id             = $queried_object->term_id;
		$context['category'] = get_term( $term_id, 'product_cat' );
		$context['title']    = single_term_title( '', false );
	}

	Timber::render( 'woocommerce/archive-product.twig', $context, ChiselCache::expiry() );
}
