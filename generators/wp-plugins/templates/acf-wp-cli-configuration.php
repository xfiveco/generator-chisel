<?php
/*
Plugin Name: ACF WP-CLI Configuration
*/

namespace ACF_WP_CLI_Configuration;

function set_acf_cli_path( $path ) {
	$paths[] = get_stylesheet_directory() . '/acf-cli-json/';
	return $paths;
}

add_filter( 'acfwpcli_fieldgroup_paths', 'ACF_WP_CLI_Configuration\set_acf_cli_path' );
