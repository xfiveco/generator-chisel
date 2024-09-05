<?php

namespace Chisel;

/**
 * ACF related functionalities.
 *
 * @package Chisel
 */
class AcfSync extends \ACF_Admin_Internal_Post_Type_List implements Instance {

	/**
	 * The acf groups post type.
	 *
	 * @var string
	 */
	public $post_type = 'acf-field-group';

	/**
	 * The acf groups sync data.
	 *
	 * @var array
	 */
	public $sync = array();

	/**
	 * The acf group single post id.
	 *
	 * @var null|int
	 */
	protected $post_id = null;

	/**
	 * The key of acf field group to sync.
	 *
	 * @var null|string
	 */
	protected $single_post_key = null;

	/**
	 * The acf groups sync page url.
	 *
	 * @var string
	 */
	protected $sync_page_url = '';

	/**
	 * ACF section current page
	 *
	 * @var string
	 */
	public $view = '';


	/**
	 * Class constructor.
	 */
	private function __construct() {
		$this->action_hooks();
		$this->filter_hooks();
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks() {
		add_action( 'admin_notices', array( $this, 'acf_sync_notice' ) );
		add_action( 'init', array( $this, 'set_properties' ) );

		add_filter( 'chisel_admin_styles', array( $this, 'load_plugin_scripts' ) );
		add_filter( 'chisel_admin_scripts', array( $this, 'load_plugin_scripts' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks() {
	}

	/**
	 * Set properties.
	 */
	public function set_properties() {
		if ( wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}

		// Stop if parent method doesn't exist.
		if ( ! method_exists( $this, 'setup_sync' ) ) {
			return;
		}

		global $pagenow;
		$this->view = acf_request_arg( 'post_status', '' );

		if ( $pagenow === 'edit.php' && isset( $_GET['post_type'] ) && sanitize_text_field( wp_unslash( $_GET['post_type'] ) ) === $this->post_type ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$this->view = 'all';
		}

		if ( $pagenow === 'post.php' && isset( $_GET['post'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$post_id   = absint( $_GET['post'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$post_type = get_post_type( $post_id );

			if ( $post_type === $this->post_type ) {
				$this->post_id = $post_id;
				$this->view    = 'single';
			}
		}

		if ( ! $this->view ) {
			return;
		}

		// Check for unsynced fields groups. Call a parent method.
		$this->setup_sync();

		if ( $this->view === 'single' && $this->sync ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			foreach ( $this->sync as $key => $field_group ) {
				if ( $field_group['ID'] === $this->post_id ) {
					$this->single_post_key = $key;

					break;
				}
			}
		}

		$this->sync_page_url = add_query_arg(
			array(
				'post_type'   => $this->post_type,
				'post_status' => 'sync',
			),
			admin_url( 'edit.php' )
		);
	}

	/**
	 * Enqueue plugin scripts
	 *
	 * @param array $scripts
	 *
	 * @return array
	 */
	public function load_plugin_scripts( $scripts ) {
		$scripts['acf-sync'] = array();

		return $scripts;
	}

	/**
	 * Check if sync notice needs to be displayed.
	 *
	 * @return void
	 */
	public function acf_sync_notice() {
		if ( $this->post_id && $this->single_post_key ) { // We're on a single page.
			$this->display_modal_notice();
		} elseif ( $this->sync ) {
			$this->display_admin_notice();
		}
	}

	/**
	 * Display ACF sync admin notice.
	 *
	 * @return void
	 */
	protected function display_admin_notice() {
		?>
		<div class="error">
			<p><?php esc_html_e( 'You have unsynced ACF fields.', 'chisel' ); ?> <a href="<?php echo esc_url( $this->sync_page_url ); ?>"><?php esc_html_e( ' View fields available for sync', 'chisel' ); ?></a></p>
		</div>
		<?php
	}

	/**
	 * Display ACF sync modal notice.
	 *
	 * @return void
	 */
	protected function display_modal_notice() {
		$url = $this->get_admin_url( '&acfsync=' . $this->single_post_key . '&_wpnonce=' . wp_create_nonce( 'bulk-posts' ) );
		?>
		<div class="xfive-acf-sync-modal js-xfive-acf-sync-modal is-open" role="dialog">
			<div class="xfive-acf-sync-modal__box">
				<div class="xfive-acf-sync-modal__content">
					<div class="xfive-acf-sync-modal__icon">
						<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
							<path stroke="#d63638" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"></path>
						</svg>
					</div>

					<h3>
						<?php esc_html_e( 'The field group you are editing has not been synced with your local acf json file.', 'chisel' ); ?>
						<?php esc_html_e( 'Making any changes will overwrite the local json file and result in losing data.', 'chisel' ); ?>
						<?php esc_html_e( 'This is irreversible.', 'chisel' ); ?>
					</h3>

					<div class="xfive-acf-sync-modal__actions">
						<a href="<?php echo esc_url( $this->sync_page_url ); ?>" class="acf-btn"><?php esc_html_e( 'View changes', 'chisel' ); ?></a>
						<a href="<?php echo esc_url( $url ); ?>" class="acf-btn"><?php esc_html_e( 'Sync data', 'chisel' ); ?></a>
						<button type="button" class="acf-btn acf-btn-secondary js-xfive-acf-sync-modal-close"><?php esc_html_e( 'Ignore', 'chisel' ); ?></button>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	/**
	 *  Check if the sync notice scripts should be loaded.
	 *
	 * @return bool
	 */
	public static function load_scripts() {
		return self::get_instance()->post_id && self::get_instance()->single_post_key;
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
