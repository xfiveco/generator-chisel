<?php
/**
 * The Template for displaying Author Archive pages.
 *
 * @package Chisel
 */

use Chisel\ChiselCache;
use Timber\Timber;

$context          = Timber::context();
$context['posts'] = Timber::get_posts();

Timber::render( array( 'author.twig', 'archive.twig' ), $context, ChiselCache::expiry() );
