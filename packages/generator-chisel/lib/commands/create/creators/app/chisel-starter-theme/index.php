<?php
/**
 * The main template file
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists
 *
 * @package Chisel
 */

use Chisel\Helpers\CacheHelpers;
use Timber\Timber;

$context   = Timber::context();
$templates = array( 'index.twig' );

if ( is_home() ) {
	array_unshift( $templates, 'home.twig' );
}

$context['load_more'] = array(
	'per_page'  => absint( get_option( 'posts_per_page' ) ),
	'post_type' => 'post',
);

Timber::render( $templates, $context, CacheHelpers::expiry() );
