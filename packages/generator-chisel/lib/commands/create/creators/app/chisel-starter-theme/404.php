<?php
/**
 * The Template for displaying 404 page.
 *
 * @package Chisel
 */

use Chisel\ChiselCache;
use Timber\Timber;

$context = Timber::context();

$context['post']['ID']    = 'error-404';
$context['post']['class'] = 'is-404';

Timber::render( '404.twig', $context, ChiselCache::expiry() );
