<?php

namespace Chisel;

/**
 * Class to register custom blocks.
 *
 * @package Chisel
 */
abstract class RegisterBlocks {

	/**
	 * Blocks type.
	 *
	 * @var string
	 */
	protected $blocks_type;

	/**
	 * Blocks path.
	 *
	 * @var string
	 */
	protected $blocks_folder;

	/**
	 * Blocks src path.
	 *
	 * @var string
	 */
	protected $blocks_path_src;

	/**
	 * Blocks path.
	 *
	 * @var string
	 */
	protected $blocks_path;

	/**
	 * Blocks url.
	 *
	 * @var string
	 */
	protected $blocks_url;

	/**
	 * Blocks.
	 *
	 * @var array
	 */
	protected $blocks = array();

	/**
	 * Blocks option name.
	 *
	 * @var string
	 */
	protected $blocks_option_name;

	/**
	 * Blocks version option name.
	 *
	 * @var string
	 */
	protected $blocks_version_option_name;

	/**
	 * Theme.
	 *
	 * @var mixed
	 */
	protected $theme = null;

	/**
	 * Build folder.
	 *
	 * @var string
	 */
	protected $build_folder = 'build';

	/**
	 * Src folder.
	 *
	 * @var string
	 */
	protected $src_folder = 'src';

	/**
	 * Register scripts. By default block styles are inlined and js is registered by wp. Setting this to true will use custom hndles to register and enqueue scripts and styles and styles will not be inlined.
	 *
	 * @var bool
	 */
	protected $register_scripts;

	/**
	 * Class constructor.
	 *
	 * @param string $blocks_type The blocks type : acf or wp.
	 */
	public function __construct( $blocks_type ) {
		$this->blocks_type                = $blocks_type;
		$this->theme                      = wp_get_theme();
		$this->blocks_folder              = $this->blocks_type === 'acf' ? 'blocks-acf' : 'blocks';
		$this->blocks_path                = get_template_directory() . '/' . $this->build_folder . '/' . $this->blocks_folder;
		$this->blocks_path_src            = get_template_directory() . '/' . $this->src_folder . '/' . $this->blocks_folder;
		$this->blocks_url                 = get_template_directory_uri() . '/' . $this->build_folder . '/' . $this->blocks_folder;
		$this->blocks                     = $this->get_blocks();
		$this->blocks_option_name         = 'chisel_' . $this->blocks_type;
		$this->blocks_version_option_name = 'chisel_' . $this->blocks_type . '_version';

		$this->register_scripts = apply_filters( 'chisel_blocks_register_scripts', true, $this->blocks_type );
	}

	/**
	 * Register custom blocks and their assets.
	 */
	public function register_custom_blocks() {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		if ( ! is_array( $this->blocks ) || ! $this->blocks ) {
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
			$block_path = $this->blocks_path . '/' . $block . '/';
			$block_json = $block_path . 'block.json';

			if ( ! is_file( $block_json ) ) {
				continue;
			}

			if ( $this->register_scripts ) {
				$block_url = $this->blocks_url . '/' . $block . '/';

				// Read json file to array.
				$block_metadata = wp_json_file_decode( $block_json, array( 'associative' => true ) );

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

								if ( ! in_array( $script, $ignore_scripts ) ) {
									wp_register_script(
										$block_handle,
										$file_url,
										$script_asset['dependencies'],
										$script_asset['version'],
										$register_script_args,
									);
								}
							}
						}
					}
				}
			}

			if ( $this->register_scripts ) {
				register_block_type( $block_path, $block_metadata );
			} else {
				register_block_type( $block_json );
			}

			// In case we need to do some custom logic. All variables from this method are available in the init file.
			if ( file_exists( $block_path . 'init.php' ) ) {
				include_once $block_path . 'init.php';
			}
		}
	}

	/**
	 * Get the list of all acf blocks.
	 *
	 * @return array
	 */
	protected function get_blocks() {
		$blocks         = get_option( $this->blocks_option_name, array() ) ?: array();
		$blocks_version = get_option( $this->blocks_version_option_name, 0 );

		if ( ! $blocks || version_compare( $this->theme->get( 'Version' ), $blocks_version ) ) {
			$blocks_list = is_dir( $this->blocks_path ) ? new \DirectoryIterator( $this->blocks_path ) : array();

			if ( $blocks_list ) {
				foreach ( $blocks_list as $item ) {
					if ( $item->isDot() || ! $item->isDir() ) {
						continue;
					}

					$blocks[] = $item->getFilename();
				}
			}

			if ( ! Assets::is_fast_refresh() ) {
				update_option( $this->blocks_option_name, $blocks );
				update_option( $this->blocks_version_option_name, $this->theme->get( 'Version' ) );
			}
		}

		return $blocks;
	}

	/**
	 * Get script asset.
	 *
	 * @param string $block     The block name.
	 * @param string $file_name The file name.
	 *
	 * @return array
	 */
	protected function get_block_script_asset( $block, $file_name ) {
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
