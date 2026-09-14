<?php
/**
 * The Template for displaying Search results.
 *
 * @package Chisel
 */

use Chisel\Helpers\CacheHelpers;
use Chisel\Helpers\LoadMoreHelpers;
use Timber\Timber;

$context = Timber::context();

$context['load_more'] = LoadMoreHelpers::get_context();

Timber::render( array( 'search.twig', 'archive.twig', 'index.twig' ), $context, CacheHelpers::expiry() );
