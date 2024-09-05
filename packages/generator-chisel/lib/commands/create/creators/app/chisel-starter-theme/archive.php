<?php
/**
 * The Template for displaying Archive pages.
 *
 * @package Chisel
 */

use Chisel\ChiselCache;
use Timber\Timber;

$templates = array( 'archive.twig', 'index.twig' );

$context = Timber::context();

$context['title'] = 'Archive';
if ( is_day() ) {
	$context['title'] = 'Archive: ' . get_the_date( 'D M Y' );
} elseif ( is_month() ) {
	$context['title'] = 'Archive: ' . get_the_date( 'M Y' );
} elseif ( is_year() ) {
	$context['title'] = 'Archive: ' . get_the_date( 'Y' );
} elseif ( is_tag() ) {
	$context['title'] = single_tag_title( '', false );
} elseif ( is_category() ) {
	$context['title'] = single_cat_title( '', false );
	array_unshift( $templates, 'archive-' . get_query_var( 'cat' ) . '.twig' );
} elseif ( is_post_type_archive() ) {
	$context['title'] = post_type_archive_title( '', false );
	array_unshift( $templates, 'archive-' . get_post_type() . '.twig' );
} elseif ( is_tax() ) {
	$context['title'] = single_term_title( '', false );
	array_unshift( $templates, 'archive-' . get_queried_object()->taxonomy . '.twig' );
}

$context['posts'] = Timber::get_posts();

Timber::render( $templates, $context, ChiselCache::expiry() );
