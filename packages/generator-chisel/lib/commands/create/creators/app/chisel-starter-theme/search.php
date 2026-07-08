<?php
/**
 * The Template for displaying Search results.
 *
 * @package Chisel
 */

use Chisel\Helpers\CacheHelpers;
use Chisel\Helpers\SearchHelpers;
use Timber\Timber;

$context = Timber::context();

$context['load_more'] = array(
	'per_page'  => absint( get_option( 'posts_per_page' ) ),
	'post_type' => SearchHelpers::get_searchable_post_types(),
	'search'    => get_search_query() ?: 'is_search',
);

Timber::render( array( 'search.twig', 'archive.twig', 'index.twig' ), $context, CacheHelpers::expiry() );
