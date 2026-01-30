<?php

namespace Chisel\WP;

use Timber\Timber;
use Timber\Site as TimberSite;

use Chisel\Traits\HooksSingleton;
use Chisel\Timber\ChiselImage;
use Chisel\Timber\ChiselPost;
use Chisel\Timber\ChiselProduct;
use Chisel\Timber\ChiselProductCategory;
use Chisel\Timber\ChiselTerm;
use Chisel\Timber\Components;

/**
 * Site related functionality related to timber.
 *
 * @package Chisel
 */
final class Site extends TimberSite {

	use HooksSingleton;

	/**
	 * Call parent constructor.
	 *
	 * @return bool
	 */
	protected function should_call_parent_construct(): bool {
		return true;
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
		add_filter( 'timber/locations', array( $this, 'tiwg_files_locations' ) );
		add_filter( 'timber/context', array( $this, 'add_to_context' ) );
		add_filter( 'timber/post/classmap', array( $this, 'post_classmap' ) );
		add_filter( 'timber/term/classmap', array( $this, 'term_classmap' ) );
	}

	/**
	 * Add custom Timber files locations. Let views in custom directory override default views.
	 *
	 * @param array $locations The locations.
	 *
	 * @return array
	 */
	public function tiwg_files_locations( array $locations ): array {
		$custom_templates = get_template_directory() . '/custom/views/';

		if ( is_dir( $custom_templates ) ) {
			if ( isset( $locations['__main__'] ) ) {
				array_unshift( $locations['__main__'], $custom_templates );
			} else {
				array_unshift( $locations, $custom_templates );
			}
		}

		return $locations;
	}

	/**
	 * Add data to the context.
	 *
	 * @param array $context The context.
	 * @return array
	 */
	public function add_to_context( array $context ): array {
		$context['logo']            = Components::get_logo();
		$context['menus']           = Components::get_menus();
		$context['sidebar']         = Components::get_sidebar();
		$context['copyright']       = Components::get_sidebar( 'copyright' );
		$context['footer_sidebars'] = Components::get_footer_sidebars();
		$context['the_title']       = Components::get_the_title();

		return $context;
	}

	/**
	 * Add custom post class map.
	 *
	 * @param array $classmap The class map.
	 * @return array
	 */
	public function post_classmap( array $classmap ): array {
		$custom_classmap = array(
			'post'       => ChiselPost::class,
			'page'       => ChiselPost::class,
			'product'    => ChiselProduct::class,
			'attachment' => ChiselImage::class,
		);

		$custom_post_types = CustomPostTypes::get_post_types();

		foreach ( $custom_post_types as $cpt => $data ) {
			if ( ! isset( $custom_classmap[$cpt] ) ) {
				$custom_classmap[$cpt] = ChiselPost::class;
			}
		}

		return array_merge( $classmap, $custom_classmap );
	}

	/**
	 * Add custom term class map.
	 *
	 * @param array $classmap The class map.
	 * @return array
	 */
	public function term_classmap( array $classmap ): array {
		$custom_classmap = array(
			'category'    => ChiselTerm::class,
			'product_cat' => ChiselProductCategory::class,
		);

		$custom_taxonomies = CustomTaxonomies::get_taxonomies();

		foreach ( $custom_taxonomies as $taxonomy => $data ) {
			if ( ! isset( $custom_classmap[$taxonomy] ) ) {
				$custom_classmap[$taxonomy] = ChiselTerm::class;
			}
		}

		return array_merge( $classmap, $custom_classmap );
	}
}
