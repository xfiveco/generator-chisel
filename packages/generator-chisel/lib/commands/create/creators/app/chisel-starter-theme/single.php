<?php
/**
 * The Template for displaying all single posts.
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
	Timber::render( array( 'single-' . $timber_post->ID . '.twig', 'single-' . $timber_post->post_type . '.twig', 'single.twig' ), $context, ChiselCache::expiry() );
}
