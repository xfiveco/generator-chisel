<?php
/**
 * The template for displaying Author Archive pages
 *
 * @package <%= app.nameSlug %>
 */
global $wp_query;

$context = \Timber\Timber::get_context();
$context['posts'] = \Timber\Timber::get_posts();
if ( isset( $wp_query->query_vars['author'] ) ) {
	$author = new \Timber\User( $wp_query->query_vars['author'] );
	$context['author'] = $author;
	$context['title'] = 'Author Archives: ' . $author->name();
}
\Timber\Timber::render( array( 'author.twig', 'archive.twig' ), $context );
