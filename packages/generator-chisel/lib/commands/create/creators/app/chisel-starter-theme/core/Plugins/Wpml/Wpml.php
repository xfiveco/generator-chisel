<?php

namespace Chisel\Plugins\Wpml;

use Chisel\Traits\HooksSingleton;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

/**
 * WPML plugin related functionalities.
 *
 * Registers Twig template strings for WPML String Translation. WPML theme
 * scanning only parses .php/.inc (and .js) files, so gettext calls inside
 * Twig templates are invisible to it. Right before WPML builds its list of
 * files to scan, this class extracts translation calls from views/**\/*.twig
 * into a generated PHP stub file the scanner can parse.
 *
 * Disable with: add_filter( 'chisel_wpml_twig_strings', '__return_false' );
 *
 * @package Chisel
 */
final class Wpml {

	use HooksSingleton;

	/**
	 * Generated stub file name, relative to the theme root.
	 *
	 * @var string
	 */
	private const STUB_FILENAME = 'wpml-twig-strings.php';

	/**
	 * Transient holding the stub path when writing it failed.
	 *
	 * @var string
	 */
	private const WRITE_ERROR_TRANSIENT = 'chisel_wpml_twig_strings_error';

	/**
	 * Gettext functions extracted from Twig templates.
	 *
	 * @var array
	 */
	private const GETTEXT_FUNCTIONS = array(
		'__',
		'_e',
		'_x',
		'_ex',
		'_n',
		'_nx',
		'esc_html__',
		'esc_attr__',
		'esc_html_e',
		'esc_attr_e',
	);

	/**
	 * Initialize.
	 */
	public function init(): bool {
		return defined( 'WPML_ST_VERSION' );
	}

	/**
	 * Register action hooks.
	 */
	public function action_hooks(): void {
		add_action( 'wp_ajax_wpml_get_files_to_scan', array( $this, 'maybe_generate_stub' ), 5 );
		add_action( 'admin_notices', array( $this, 'maybe_render_write_error' ) );
	}

	/**
	 * Register filter hooks.
	 */
	public function filter_hooks(): void {
	}

	/**
	 * Regenerate the stub right before WPML builds its file list for this theme.
	 */
	public function maybe_generate_stub(): void {
		if ( ! apply_filters( 'chisel_wpml_twig_strings', true ) ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- read-only theme name check; WPML verifies the nonce in its own handler on the same action.
		$theme = isset( $_POST['theme'] ) ? sanitize_text_field( wp_unslash( $_POST['theme'] ) ) : '';

		if ( $theme !== get_template() ) {
			return;
		}

		$this->generate_stub();
	}

	/**
	 * Extract gettext calls from all Twig templates and write the stub file.
	 */
	public function generate_stub(): void {
		$views_dir = get_template_directory() . '/views';

		if ( ! is_dir( $views_dir ) ) {
			return;
		}

		$calls = array();

		foreach ( $this->get_twig_files( $views_dir ) as $file ) {
			$calls = array_merge( $calls, $this->extract_calls( $file ) );
		}

		$this->write_stub( array_values( array_unique( $calls ) ) );
	}

	/**
	 * Find all .twig files under the given directory.
	 *
	 * @param string $directory Directory to search.
	 *
	 * @return array
	 */
	private function get_twig_files( string $directory ): array {
		$files    = array();
		$iterator = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $directory, RecursiveDirectoryIterator::SKIP_DOTS )
		);

		foreach ( $iterator as $file ) {
			if ( $file->getExtension() === 'twig' ) {
				$files[] = $file->getPathname();
			}
		}

		return $files;
	}

	/**
	 * Extract gettext calls from a single Twig template.
	 *
	 * Only calls whose text/context/domain arguments are string literals are
	 * extracted — calls built from Twig variables cannot be registered anyway.
	 *
	 * @param string $file Absolute path to the Twig file.
	 *
	 * @return array PHP statements for the stub file.
	 */
	private function extract_calls( string $file ): array {
		$content = file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		if ( ! $content ) {
			return array();
		}

		$functions = implode( '|', array_map( 'preg_quote', self::GETTEXT_FUNCTIONS ) );

		if ( ! preg_match_all( '/(?<![\w.])(' . $functions . ')\(([^()]*)\)/s', $content, $matches, PREG_SET_ORDER ) ) {
			return array();
		}

		$calls = array();

		foreach ( $matches as $match ) {
			preg_match_all( '/([\'"])(?:\\\\.|(?!\1).)*\1/s', $match[2], $strings );

			$call = $this->build_call( $match[1], $strings[0] );

			if ( $call !== null ) {
				$calls[] = $call;
			}
		}

		return $calls;
	}

	/**
	 * Rebuild a gettext call as a PHP statement from its string literal arguments.
	 *
	 * @param string $_function Gettext function name.
	 * @param array  $strings   String literals found in the call arguments, quotes included.
	 *
	 * @return string|null
	 */
	private function build_call( string $_function, array $strings ): ?string {
		$count = count( $strings );

		switch ( $_function ) {
			case '_n':
				if ( $count < 3 ) {
					return null;
				}
				return sprintf( '_n( %s, %s, 1, %s );', $strings[0], $strings[1], $strings[ $count - 1 ] );

			case '_nx':
				if ( $count < 4 ) {
					return null;
				}
				return sprintf( '_nx( %s, %s, 1, %s, %s );', $strings[0], $strings[1], $strings[ $count - 2 ], $strings[ $count - 1 ] );

			case '_x':
			case '_ex':
				if ( $count < 3 ) {
					return null;
				}
				return sprintf( '%s( %s, %s, %s );', $_function, $strings[0], $strings[1], $strings[ $count - 1 ] );

			default:
				if ( $count < 2 ) {
					return null;
				}
				return sprintf( '%s( %s, %s );', $_function, $strings[0], $strings[ $count - 1 ] );
		}
	}

	/**
	 * Write (or remove, when no strings were found) the stub file.
	 *
	 * @param array $calls PHP statements to write.
	 */
	private function write_stub( array $calls ): void {
		$path = get_template_directory() . '/' . self::STUB_FILENAME;

		if ( empty( $calls ) ) {
			if ( file_exists( $path ) ) {
				wp_delete_file( $path );
			}
			return;
		}

		$content  = "<?php\n";
		$content .= "/**\n";
		$content .= " * Auto-generated by Chisel\\Plugins\\Wpml\\Wpml — do not edit.\n";
		$content .= " *\n";
		$content .= " * Gettext calls extracted from views/**/*.twig so WPML String Translation\n";
		$content .= " * can register them during a theme scan. Regenerated on every scan.\n";
		$content .= " */\n\n";
		$content .= "defined( 'ABSPATH' ) || exit;\n\n";
		$content .= "return; // Never executed — this file only exists to be parsed by the WPML scanner.\n\n";
		$content .= implode( "\n", $calls ) . "\n";

		$writable = wp_is_writable( get_template_directory() ) && ( ! file_exists( $path ) || wp_is_writable( $path ) );
		$written  = $writable ? file_put_contents( $path, $content ) : false; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents

		if ( $written === false ) {
			set_transient( self::WRITE_ERROR_TRANSIENT, $path, DAY_IN_SECONDS );
		} else {
			delete_transient( self::WRITE_ERROR_TRANSIENT );
		}
	}

	/**
	 * Show an admin notice when the stub file could not be written.
	 */
	public function maybe_render_write_error(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$path = get_transient( self::WRITE_ERROR_TRANSIENT );

		if ( ! $path ) {
			return;
		}

		delete_transient( self::WRITE_ERROR_TRANSIENT );

		printf(
			'<div class="notice notice-error"><p>%s</p></div>',
			sprintf(
				/* translators: %s: stub file path. */
				esc_html__( 'Chisel could not write the WPML Twig strings file (%s) — the theme directory is not writable. Strings from Twig templates were not registered during the last WPML scan.', 'chisel' ),
				'<code>' . esc_html( $path ) . '</code>'
			)
		);
	}
}
