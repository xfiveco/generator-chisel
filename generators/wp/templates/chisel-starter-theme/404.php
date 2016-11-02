<?php
/**
 * The template for displaying 404 pages (Not Found)
 *
 * @package  WordPress
 * @subpackage  X5
 */

$context = Timber::get_context();
Timber::render( '404.twig', $context );
