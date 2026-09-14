<?php
/**
 * The Template for displaying Author Archive pages.
 *
 * @package Chisel
 */

use Chisel\Helpers\CacheHelpers;
use Chisel\Helpers\LoadMoreHelpers;
use Timber\Timber;

$context = Timber::context();

$context['load_more'] = LoadMoreHelpers::get_context();

Timber::render( array( 'author.twig', 'archive.twig' ), $context, CacheHelpers::expiry() );
