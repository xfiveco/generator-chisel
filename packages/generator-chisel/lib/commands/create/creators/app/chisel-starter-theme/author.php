<?php
/**
 * The Template for displaying Author Archive pages.
 *
 * @package Chisel
 */

use Chisel\ChiselCache;
use Timber\Timber;

$author = Timber::get_user( get_queried_object_id() );

$context           = Timber::context();
$context['posts']  = Timber::get_posts();
$context['author'] = $author;
$context['title']  = __( 'Author: ', 'chisel' ) . $author->name;

Timber::render( array( 'author.twig', 'archive.twig' ), $context, ChiselCache::expiry() );
