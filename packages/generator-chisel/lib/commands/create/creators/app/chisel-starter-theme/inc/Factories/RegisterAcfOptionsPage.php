<?php

namespace Chisel\Factories;

use Chisel\Enums\AcfOptionsPageType;

/**
 * Custom post types wrapper class.
 *
 * @package Chisel
 */
final class RegisterAcfOptionsPage {

	/**
	 * Page arguments.
	 *
	 * @var array
	 */
	private array $args;

	/**
	 * Page type - inc/Enums/Acf.php/AcfOptionsPageType
	 *
	 * @var AcfOptionsPageType
	 */
	private AcfOptionsPageType $type;

	/**
	 * Class constructor.
	 *
	 * @param array                     $args  page arguments.
	 * @param AcfOptionsPageType|string $type  page or subpage.
	 */
	public function __construct( array $args, AcfOptionsPageType|string $type = AcfOptionsPageType::Page ) {
		$this->args = $args;
		$this->type = $type instanceof AcfOptionsPageType ? $type : AcfOptionsPageType::from( $type );
	}

	/**
	 * Register ACF options page.
	 */
	public function register(): void {
		$page_title      = $this->args['page_title'] ?? 'Options';
		$menu_title      = $this->args['menu_title'] ?? $page_title;
		$menu_slug       = $this->args['menu_slug'] ?? 'options';
		$capability      = $this->args['capability'] ?? 'edit_posts';
		$position        = $this->args['position'] ?? 45;
		$redirect        = $this->args['redirect'] ?? true;
		$icon_url        = $this->args['icon_url'] ?? 'dashicons-screenoptions';
		$post_id         = $this->args['post_id'] ?? 'options';
		$autoload        = $this->args['autoload'] ?? false;
		$update_button   = $this->args['update_button'] ?? __( 'Update', 'chisel' );
		$updated_message = $this->args['updated_message'] ?? __( 'Options Updated', 'chisel' );
		$parent_slug     = $this->args['parent_slug'] ?? '';

		$options_page_args = array(
			'page_title'      => $page_title,
			'menu_title'      => $menu_title,
			'menu_slug'       => $menu_slug,
			'capability'      => $capability,
			'position'        => $position,
			'redirect'        => $redirect,
			'icon_url'        => $icon_url,
			'post_id'         => $post_id,
			'autoload'        => $autoload,
			'update_button'   => $update_button,
			'updated_message' => $updated_message,
		);

		if ( $this->type === AcfOptionsPageType::SubPage ) {
			$options_page_args['parent_slug'] = $parent_slug;

			acf_add_options_sub_page( $options_page_args );
		} else {
			acf_add_options_page( $options_page_args );
		}
	}
}
