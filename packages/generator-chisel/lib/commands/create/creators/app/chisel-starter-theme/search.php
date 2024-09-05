<?php
/**
 * The Template for displaying Search results.
 *
 * @package Chisel
 */

use Chisel\ChiselCache;
use Timber\Timber;

$context          = Timber::context();
$context['posts'] = Timber::get_posts();
$context['title'] = __( 'Search results for: ', 'chisel' ) . get_search_query();

Timber::render( array( 'search.twig', 'archive.twig', 'index.twig' ), $context, ChiselCache::expiry() );
