<?php

use Chisel\Blocks;

$context = array(
	'wrapper_attributes' => get_block_wrapper_attributes(),
	'attributes'         => $attributes,
	'content'            => $content,
	'block'              => $block,
);

Blocks::render_twig_file( $block->name, $context );
