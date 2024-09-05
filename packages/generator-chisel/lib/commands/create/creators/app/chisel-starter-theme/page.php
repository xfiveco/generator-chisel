<?php
/**
 * The Template for displaying all pages.
 *
 * @package Chisel
 */

use Chisel\ChiselCache;
use Timber\Timber;

$context = Timber::context();

$timber_post = Timber::get_post();

if ( post_password_required( $timber_post->ID ) ) {
	Timber::render( 'single-password.twig', $context, ChiselCache::expiry() );
} else {
	$templates = array( 'page-' . $timber_post->post_name . '.twig', 'page.twig' );

	if ( is_front_page() ) {
		array_unshift( $templates, 'front-page.twig' );
	}

	Timber::render( $templates, $context, ChiselCache::expiry() );
}
