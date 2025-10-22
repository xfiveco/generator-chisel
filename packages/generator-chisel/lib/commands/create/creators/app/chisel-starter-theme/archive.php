<?php
/**
 * The Template for displaying Archive pages.
 *
 * @package Chisel
 */

use Chisel\Helpers\CacheHelpers;
use Timber\Timber;

$templates = array( 'archive.twig', 'index.twig' );

$context = Timber::context();

if ( is_tag() ) {
	array_unshift( $templates, 'archive-' . get_queried_object()->slug . '.twig' );
} elseif ( is_category() ) {
	array_unshift( $templates, 'archive-' . get_queried_object()->slug . '.twig' );
} elseif ( is_post_type_archive() ) {
	array_unshift( $templates, 'archive-' . get_post_type() . '.twig' );
} elseif ( is_tax() ) {
	array_unshift( $templates, 'archive-' . get_queried_object()->taxonomy . '.twig' );
}

Timber::render( $templates, $context, CacheHelpers::expiry() );
