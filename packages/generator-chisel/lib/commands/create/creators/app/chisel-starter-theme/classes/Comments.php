<?php

namespace Chisel;

/**
 * Comments related functionalities.
 *
 * @package Chisel
 */
class Comments implements Instance {

	/**
	 * Disable comments
	 *
	 * @var bool
	 */
	protected $disable_comments;

	/**
	 *  Post types for which comments are disabled.
	 *
	 * @var array
	 */
	protected $post_types = array(
		'post',
		'page',
	);

	/**
	 * Class constructor.
	 */
	private function __construct() {
		$this->set_properties();

		if ( $this->disable_comments ) {
			$this->action_hooks();
			$this->filter_hooks();
		}
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {
		$this->disable_comments = apply_filters( 'chisel_disable_comments', true );
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
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
	public function filter_hooks() {
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
	public function disable_comments_for_post_types() {
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
	public function remove_admin_menu() {
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
	public function admin_css() {
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
	public function filter_dashboard() {
		remove_meta_box( 'dashboard_recent_comments', 'dashboard', 'normal' );
	}

	/**
	 * Disable recent comments widget.
	 */
	public function disable_rc_widget() {
		unregister_widget( 'WP_Widget_Recent_Comments' );
		add_filter( 'show_recent_comments_widget_style', '__return_false' );
	}

	/**
	 * Filter feed query
	 */
	public function filter_query() {
		if ( is_comment_feed() ) {
			wp_die( esc_html__( 'Comments are closed.' ), '', array( 'response' => 403 ) );
		}
	}

	/**
	 * Remove comment links from admin bar.
	 */
	public function filter_admin_bar() {
		remove_action( 'admin_bar_menu', 'wp_admin_bar_comments_menu', 60 );

		if ( is_multisite() ) {
			add_action( 'admin_bar_menu', array( $this, 'remove_network_comment_links' ), 500 );
		}
	}

	/**
	 * Disable comments template on single posts.
	 */
	public function check_comment_template() {
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
	public function filter_gutenberg() {
		add_action( 'admin_footer', array( $this, 'print_footer_scripts' ) );
	}

	/**
	 * Unregister comments blocks and panels.
	 */
	public function print_footer_scripts() {
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

				wp.data.dispatch( 'core/edit-post')?.removeEditorPanel( 'discussion-panel' ); // Discussion
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
	public function filter_rest_endpoints( $endpoints ) {
		if ( isset( $endpoints['comments'] ) ) {
			unset( $endpoints['comments'] );
		}
		if ( isset( $endpoints['/wp/v2/comments'] ) ) {
			unset( $endpoints['/wp/v2/comments'] );
		}
		if ( isset( $endpoints['/wp/v2/comments/(?P<id>[\d]+)'] ) ) {
			unset( $endpoints['/wp/v2/comments/(?P<id>[\d]+)'] );
		}

		return $endpoints;
	}

	/**
	 * Remove comments from XML-RPC
	 *
	 * @param array $methods
	 *
	 * @return array
	 */
	public function disable_xmlrc_comments( $methods ) {
		unset( $methods['wp.newComment'] );

		return $methods;
	}

	/**
	 * Remove comments from REST API
	 *
	 * @param array           $prepared_comment
	 * @param WP_REST_Request $request
	 *
	 * @return WP_Error
	 */
	public function disable_rest_api_comments( $prepared_comment, $request ) {
		return new \WP_Error( 'rest_comment_disabled', 'Commenting is disabled.', array( 'status' => 403 ) );
	}

	/**
	 * Remove comment links from network admin bar.
	 *
	 * @param WP_Admin_Bar $wp_admin_bar
	 *
	 * @return void
	 */
	public function remove_network_comment_links( $wp_admin_bar ) {
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
	public function filter_wp_headers( $headers ) {
		unset( $headers['X-Pingback'] );

		return $headers;
	}

	/**
	 * Display comments template - the comments and the form.
	 *
	 * @return void
	 */
	public static function comments_template() {
		if ( ! post_type_supports( get_post_type(), 'comments' ) ) {
			return;
		}

		if ( comments_open() ) {
			return apply_filters( 'the_content', '<!-- wp:pattern {"slug":"chisel/comments"} /-->' );
		}
	}

	/**
	 * Get the instance of the class.
	 */
	public static function get_instance() {
		static $instance = null;

		if ( null === $instance ) {
			$instance = new self();
		}

		return $instance;
	}
}
