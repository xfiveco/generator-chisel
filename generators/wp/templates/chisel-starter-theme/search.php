<?php
/**
 * Search results page
 *
 * @package wp
 */

$templates = array( 'search.twig', 'archive.twig', 'index.twig' );
$context = \Timber\Timber::get_context();

$context['title'] = 'Search results for '. get_search_query();
$context['posts'] = \Timber\Timber::get_posts();

\Timber\Timber::render( $templates, $context );
