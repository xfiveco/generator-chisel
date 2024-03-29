<?php
/**
 * The Template for displaying all single posts
 *
 * Methods for TimberHelper can be found in the /lib sub-directory
 *
 * @package <%= app.nameSlug %>
 */

global $post;

$context = \Timber\Timber::get_context();

if ( post_password_required( $post->ID ) ) {
	\Timber\Timber::render( 'single-password.twig', $context );
} else {
	\Timber\Timber::render( array( 'single-' . $post->ID . '.twig', 'single-' . $post->post_type . '.twig', 'single.twig' ), $context );
}
