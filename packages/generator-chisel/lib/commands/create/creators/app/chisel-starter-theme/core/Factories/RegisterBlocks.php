<?php

namespace Chisel\Factories;

use Chisel\WP\Assets;
use Chisel\Helpers\ThemeHelpers;
use Chisel\Enums\BlocksType;

/**
 * Class to register custom blocks.
 *
 * @package Chisel
 */
final class RegisterBlocks {

	/**
	 * Blocks type.
	 *
	 * @var BlocksType|string
	 */
	private BlocksType|string $blocks_type;

	/**
	 * Blocks path.
	 *
	 * @var string
	 */
	private string $blocks_folder;

	/**
	 * Blocks src path.
	 *
	 * @var string
	 */
	private string $blocks_path_src;

	/**
	 * Blocks path.
	 *
	 * @var string
	 */
	private string $blocks_path;

	/**
	 * Blocks url.
	 *
	 * @var string
	 */
	private string $blocks_url;

	/**
	 * Blocks.
	 *
	 * @var array
	 */
	private array $blocks = array();

	/**
	 * Theme.
	 *
	 * @var \WP_Theme
	 */
	private ?\WP_Theme $theme = null;

	/**
	 * Build folder.
	 *
	 * @var string
	 */
	private string $build_folder = 'build';

	/**
	 * Src folder.
	 *
	 * @var string
	 */
	private string $src_folder = 'src';

	/**
	 * Register scripts. By default block styles are inlined and js is registered by wp. Setting this to true will use custom hndles to register and enqueue scripts and styles and styles will not be inlined.
	 *
	 * @var bool
	 */
	private bool $register_scripts;

	/**
	 * Class constructor.
	 *
	 * @param BlocksType|string $blocks_type The blocks type : acf or wp.
	 */
	public function __construct( BlocksType|string $blocks_type ) {
		$blocks_type           = $blocks_type instanceof BlocksType ? $blocks_type : BlocksType::from( $blocks_type );
		$this->blocks_type     = $blocks_type->value;
		$this->theme           = wp_get_theme();
		$this->blocks_folder   = $blocks_type->folder_name();
		$this->blocks_path     = get_template_directory() . '/' . $this->build_folder . '/' . $this->blocks_folder;
		$this->blocks_path_src = get_template_directory() . '/' . $this->src_folder . '/' . $this->blocks_folder;
		$this->blocks_url      = get_template_directory_uri() . '/' . $this->build_folder . '/' . $this->blocks_folder;
		$this->blocks          = $this->get_blocks();

		$this->register_scripts = (bool) apply_filters( 'chisel_blocks_register_scripts', true, $this->blocks_type );
	}

	/**
	 * Register custom blocks and their assets.
	 */
	public function register_custom_blocks(): void {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		if ( ! is_array( $this->blocks ) || empty( $this->blocks ) ) {
			return;
		}

		$block_scripts = array(
			'editorScript',
			'editorStyle',
			'style',
			'script',
			'viewScript',
			'viewStyle',
		);

		foreach ( $this->blocks as $block ) {
			$block_path     = $this->blocks_path . '/' . $block . '/';
			$block_path_src = $this->blocks_path_src . '/' . $block . '/';
			$block_json     = $block_path . 'block.json';

			if ( ! is_file( $block_json ) ) {
				continue;
			}

			if ( $this->register_scripts ) {
				$block_url = $this->blocks_url . '/' . $block . '/';

				// Read json file to array.
				$decoded = wp_json_file_decode( $block_json, array( 'associative' => true ) );
				if ( ! is_array( $decoded ) ) {
					// Skip malformed block.json.
					continue;
				}

				$block_metadata = $decoded;

				foreach ( $block_scripts as $script ) {
					if ( ! isset( $block_metadata[$script] ) ) {
						continue;
					}

					$block_files = is_array( $block_metadata[$script] ) ? $block_metadata[$script] : array( $block_metadata[$script] );

					if ( ! $block_files ) {
						continue;
					}

					$script_handle = strtolower( $script );
					$block_handle  = 'block-' . $this->blocks_type . '-' . $block . '-' . $script_handle;

					foreach ( $block_files as $block_file ) {
						if ( isset( $block_file ) && strpos( $block_file, 'file:' ) !== false ) {
							$file_name      = str_replace( 'file:./', '', $block_file );
							$is_style       = strpos( $script_handle, 'style' ) !== false;
							$ignore_scripts = isset( $block_metadata['ignoreScripts'] ) ? $block_metadata['ignoreScripts'] : array();

							// Set the asset handle.
							$block_metadata[$script] = $block_handle;

							$file_path    = $block_path . $file_name;
							$file_url     = $block_url . $file_name;
							$script_asset = $this->get_block_script_asset( $block, $file_name );

							if ( is_file( $file_path ) && $is_style ) {
								wp_register_style( $block_handle, $file_url, array(), $script_asset['version'] );
							}

							if ( is_file( $file_path ) && ! $is_style ) {
								$register_script_args = apply_filters(
									'chisel_block_register_script_args',
									array(
										'strategy'  => 'defer',
										'in_footer' => true,
									),
									$block_handle,
									$block
								);

								// Register ignored scripts in dev mode in order to watch changes.
								if ( ThemeHelpers::is_fast_refresh() || ( ! ThemeHelpers::is_fast_refresh() && ! in_array( $script, $ignore_scripts, true ) ) ) {
									if ( 'viewscriptmodule' === $script_handle ) {
										wp_register_script_module(
											$block_handle,
											$file_url,
											$script_asset['dependencies'],
											$script_asset['version']
										);
									} else {
										wp_register_script(
											$block_handle,
											$file_url,
											$script_asset['dependencies'],
											$script_asset['version'],
											$register_script_args
										);
									}
								}
							}
						}
					}
				}
			}

			if ( $this->register_scripts ) {
				// Server-side registration with customized asset handles.
				register_block_type( $block_path, $block_metadata );
			} else {
				// Let WP infer assets from block.json.
				register_block_type( $block_json );
			}

			// In case we need to do some custom logic. All variables from this method are available in the init file.
			$init_php = $block_path_src . 'init.php';
			if ( is_file( $init_php ) ) {
				include_once $init_php;
			}
		}
	}

	/**
	 * Get the list of all acf blocks.
	 *
	 * @return array
	 */
	public function get_blocks(): array {
		if ( $this->blocks ) {
			return $this->blocks;
		}

		$blocks_list = is_dir( $this->blocks_path ) ? new \DirectoryIterator( $this->blocks_path ) : array();

		if ( $blocks_list ) {
			foreach ( $blocks_list as $item ) {
				if ( $item->isDot() || ! $item->isDir() ) {
					continue;
				}

				$block_name = $item->getFilename();

				if ( ! in_array( $block_name, $this->blocks, true ) ) {
					$this->blocks[] = $item->getFilename();
				}
			}
		}

		return $this->blocks;
	}

	/**
	 * Get the blocks url.
	 *
	 * @return string
	 */
	public function get_blocks_url(): string {
		return $this->blocks_url;
	}

	/**
	 * Get the blocks path.
	 *
	 * @return string
	 */
	public function get_blocks_path(): string {
		return $this->blocks_path;
	}

	/**
	 * Get the blocks path src.
	 *
	 * @return string
	 */
	public function get_blocks_path_src(): string {
		return $this->blocks_path_src;
	}

	/**
	 * Get script asset.
	 *
	 * @param string $block     The block name.
	 * @param string $file_name The file name.
	 *
	 * @return array
	 */
	private function get_block_script_asset( string $block, string $file_name ): array {
		$block_path        = $this->blocks_path . '/' . $block . '/';
		$assets_file_name  = preg_replace( '/\.[^.]+$/', '', $file_name ) . '.asset.php';
		$script_asset_path = $block_path . $assets_file_name;
		$script_asset      = array(
			'dependencies' => array(),
			'version'      => $this->theme->get( 'Version' ),
		);

		if ( is_file( $script_asset_path ) ) {
			$script_asset = include $script_asset_path;
		}

		return $script_asset;
	}
}
