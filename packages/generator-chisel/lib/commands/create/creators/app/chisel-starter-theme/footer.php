<?php
/**
 * Third party plugins that hijack the theme will call wp_footer() to get the footer template.
 * We use this to end our output buffer (started in header.php) and render into the view/page-plugin.twig template.
 *
 * If you're not using a plugin that requries this behavior (ones that do include Events Calendar Pro and
 * WooCommerce) you can delete this file and header.php
 *
 * @package Chisel
 */

use Chisel\ChiselCache;

$context = $GLOBALS['timberContext'];

if ( ! isset( $context ) ) {
	throw new \Exception( 'Timber context not set in footer.' );
}

$context['content'] = ob_get_contents();
ob_end_clean();
$templates = array( 'page-plugin.twig' );

\Timber\Timber::render( $templates, $context, ChiselCache::expiry() );
