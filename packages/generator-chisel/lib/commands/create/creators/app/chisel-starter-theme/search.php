<?php
/**
 * The Template for displaying Search results.
 *
 * @package Chisel
 */

use Chisel\Helpers\CacheHelpers;
use Timber\Timber;

$context = Timber::context();

Timber::render( array( 'search.twig', 'archive.twig', 'index.twig' ), $context, CacheHelpers::expiry() );
