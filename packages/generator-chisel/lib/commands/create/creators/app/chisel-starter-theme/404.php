<?php
/**
 * The Template for displaying 404 page.
 *
 * @package Chisel
 */

use Chisel\Helpers\CacheHelpers;
use Timber\Timber;

$context = Timber::context();

$context['post']['ID']    = 'error-404';
$context['post']['class'] = 'is-404';

Timber::render( '404.twig', $context, CacheHelpers::expiry() );
