<?php

namespace Chisel\WP;

use Chisel\Traits\HooksSingleton;

/**
 * Comments related functionalities.
 *
 * @package Chisel
 */
final class Comments {

	use HooksSingleton;

	/**
	 * Disable comments
	 *
	 * @var bool
	 */
	private bool $disable_comments = true;

	/**
	 *  Post types for which comments are disabled.
	 *
	 * @var array
	 */
	private array $post_types = array(
		'post',
		'page',
	);

	/**
	 * Set properties.
	 */
	public function set_properties(): void {
		$this->disable_comments = apply_filters( 'chisel_disable_comments', $this->disable_comments );
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		if ( $this->disable_comments === false ) {
			return;
		}

		add_action( 'after_setup_theme', array( $this, 'disable_comments_for_post_types' ), 99 );
		add_action( 'admin_menu', array( $this, 'remove_admin_menu' ), 999 );

		add_action( 'admin_print_styles-index.php', array( $this, 'admin_css' ) );
		add_action( 'admin_print_styles-profile.php', array( $this, 'admin_css' ) );
		add_action( 'wp_dashboard_setup', array( $this, 'filter_dashboard' ) );

		add_action( 'widgets_init', array( $this, 'disable_rc_widget' ) );
		add_action( 'template_redirect', array( $this, 'filter_query' ), 9 ); // before redirect_canonical.
		add_action( 'add_admin_bar_menus', array( $this, 'filter_admin_bar' ), 0 );
		add_action( 'admin_init', array( $this, 'filter_admin_bar' ) );

		add_action( 'template_redirect', array( $this, 'check_comment_template' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'filter_gutenberg' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {

		if ( $this->disable_comments === false ) {
			return;
		}

		add_filter( 'wp_headers', array( $this, 'filter_wp_headers' ) );
		add_filter( 'pre_option_default_pingback_flag', '__return_zero' );
		add_filter( 'comments_open', '__return_false', 20 );
		add_filter( 'pings_open', '__return_false', 20 );

		// Remove comments links from feed.
		add_filter( 'post_comments_feed_link', '__return_false' );
		add_filter( 'comments_link_feed', '__return_false' );
		add_filter( 'comment_link', '__return_false' );

		// Remove comment count from feed.
		add_filter( 'get_comments_number', '__return_false' );

		// Remove feed link from header.
		add_filter( 'feed_links_show_comments_feed', '__return_false' );

		add_filter( 'rest_endpoints', array( $this, 'filter_rest_endpoints' ) );
		add_filter( 'xmlrpc_methods', array( $this, 'disable_xmlrc_comments' ) );
		add_filter( 'rest_pre_insert_comment', array( $this, 'disable_rest_api_comments' ), 10, 2 );
		add_filter( 'comments_array', '__return_empty_array', 20 );
	}

	/**
	 * Disable comments for post types
	 *
	 * @return void
	 */
	public function disable_comments_for_post_types(): void {
		$this->post_types = apply_filters( 'chisel_disable_comments_post_types', $this->post_types );

		if ( $this->post_types ) {
			foreach ( $this->post_types as $post_type ) {
				if ( post_type_supports( $post_type, 'comments' ) ) {
					remove_post_type_support( $post_type, 'comments' );
				}

				if ( post_type_supports( $post_type, 'trackbacks' ) ) {
					remove_post_type_support( $post_type, 'trackbacks' );
				}
			}
		}
	}

	/**
	 * Remove comments related admin menus.
	 */
	public function remove_admin_menu(): void {
		global $pagenow;

		if ( in_array( $pagenow, array( 'comment.php', 'edit-comments.php', 'options-discussion.php' ), true ) ) {
			wp_die( esc_html__( 'Comments are closed.', 'chisel' ), '', array( 'response' => 403 ) );
		}

		remove_menu_page( 'edit-comments.php' );
		remove_submenu_page( 'options-general.php', 'options-discussion.php' );
	}

	/**
	 * Add custom CSS to dashboard.
	 */
	public function admin_css(): void {
		?>
		<style>
			#dashboard_right_now .comment-count,
			#dashboard_right_now .comment-mod-count,
			#latest-comments,
			#welcome-panel .welcome-comments,
			.user-comment-shortcuts-wrap{
				display:none !important;
			}
		</style>
		<?php
	}

	/**
	 * Remove comments from dashboard.
	 */
	public function filter_dashboard(): void {
		remove_meta_box( 'dashboard_recent_comments', 'dashboard', 'normal' );
	}

	/**
	 * Disable recent comments widget.
	 */
	public function disable_rc_widget(): void {
		unregister_widget( 'WP_Widget_Recent_Comments' );
		add_filter( 'show_recent_comments_widget_style', '__return_false' );
	}

	/**
	 * Filter feed query
	 */
	public function filter_query(): void {
		if ( is_comment_feed() ) {
			wp_die( esc_html__( 'Comments are closed.' ), '', array( 'response' => 403 ) );
		}
	}

	/**
	 * Remove comment links from admin bar.
	 */
	public function filter_admin_bar(): void {
		remove_action( 'admin_bar_menu', 'wp_admin_bar_comments_menu', 60 );

		if ( is_multisite() ) {
			add_action( 'admin_bar_menu', array( $this, 'remove_network_comment_links' ), 500 );
		}
	}

	/**
	 * Disable comments template on single posts.
	 */
	public function check_comment_template(): void {
		if ( is_singular() ) {
			// Kill the comments' template.
			add_filter( 'comments_template', '__return_empty_string', 20 );
			// Remove comment-reply script.
			wp_deregister_script( 'comment-reply' );
			// Remove feed action.
			remove_action( 'wp_head', 'feed_links_extra', 3 );
		}
	}

	/**
	 * Add hook to run custom script.
	 */
	public function filter_gutenberg(): void {
		add_action( 'admin_footer', array( $this, 'print_footer_scripts' ) );
	}

	/**
	 * Unregister comments blocks and panels.
	 */
	public function print_footer_scripts(): void {
		?>
		<script>
			wp.domReady( () => {
				const blockType = 'core/latest-comments';
				if (!wp?.data) {
					return;
				}

				if ( wp?.blocks && wp.data && wp.data.select( 'core/blocks' ).getBlockType( blockType ) ){
					wp.blocks.unregisterBlockType( blockType );
				}

				wp.data.dispatch( 'core/editor')?.removeEditorPanel( 'discussion-panel' ); // Discussion
			} );
		</script>
		<?php
	}

	/**
	 * Remove comments from REST API
	 *
	 * @param array $endpoints
	 *
	 * @return array
	 */
	public function filter_rest_endpoints( array $endpoints ): array {
		unset( $endpoints['comments'], $endpoints['/wp/v2/comments'], $endpoints['/wp/v2/comments/(?P<id>[\d]+)'] );

		return $endpoints;
	}

	/**
	 * Remove comments from XML-RPC
	 *
	 * @param array $methods
	 *
	 * @return array
	 */
	public function disable_xmlrc_comments( array $methods ): array {
		unset( $methods['wp.newComment'] );

		return $methods;
	}

	/**
	 * Remove comments from REST API
	 *
	 * @param array            $prepared_comment
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_Error
	 */
	public function disable_rest_api_comments( array $prepared_comment, \WP_REST_Request $request ): \WP_Error {
		return new \WP_Error( 'rest_comment_disabled', 'Commenting is disabled.', array( 'status' => 403 ) );
	}

	/**
	 * Remove comment links from network admin bar.
	 *
	 * @param \WP_Admin_Bar $wp_admin_bar
	 *
	 * @return void
	 */
	public function remove_network_comment_links( \WP_Admin_Bar $wp_admin_bar ): void {
		if ( is_user_logged_in() ) {
			foreach ( (array) $wp_admin_bar->user->blogs as $blog ) {
				$wp_admin_bar->remove_menu( 'blog-' . $blog->userblog_id . '-c' );
			}
		}
	}

	/**
	 * Remove pingback from headers.
	 *
	 * @param array $headers
	 *
	 * @return array
	 */
	public function filter_wp_headers( array $headers ): array {
		unset( $headers['X-Pingback'] );

		return $headers;
	}
}
