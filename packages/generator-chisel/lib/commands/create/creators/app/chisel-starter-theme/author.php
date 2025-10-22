<?php
/**
 * The Template for displaying Author Archive pages.
 *
 * @package Chisel
 */

use Chisel\Helpers\CacheHelpers;
use Timber\Timber;

$context = Timber::context();

Timber::render( array( 'author.twig', 'archive.twig' ), $context, CacheHelpers::expiry() );
