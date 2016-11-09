<?php
/**
 * The template for displaying Author Archive pages
 *
 * @package <%= nameSlug %>
 */
global $wp_query;

$context = Timber::get_context();
$context['posts'] = Timber::get_posts();
if ( isset( $wp_query->query_vars['author'] ) ) {
	$author = new TimberUser( $wp_query->query_vars['author'] );
	$context['author'] = $author;
	$context['title'] = 'Author Archives: ' . $author->name();
}
Timber::render( array( 'author.twig', 'archive.twig' ), $context );
