<?php
/**
 * Title: Call to Action 01
 * Slug: chisel/cta-01
 * Categories: chisel-patterns/cta
 * Description: A CTA section pattern 01
 * Keywords: cta
 *
 * @package Chisel
 */

?>

<!-- wp:cover {"overlayColor":"secondary","isUserOverlayColor":true,"isDark":false,"layout":{"type":"constrained"}} -->
<div class="wp-block-cover is-light"><span aria-hidden="true" class="wp-block-cover__background has-secondary-background-color has-background-dim-100 has-background-dim"></span><div class="wp-block-cover__inner-container"><!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'CTA Title', 'chisel' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center"><?php esc_html_e( 'CTA text, i.e. lorem ipsum or something.', 'chisel' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":"auto","className":"is-style-tiny"} -->
<div style="height:auto" aria-hidden="true" class="wp-block-spacer is-style-tiny"></div>
<!-- /wp:spacer -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-primary-outline"} -->
<div class="wp-block-button is-style-primary-outline"><a class="wp-block-button__link wp-element-button"><?php esc_html_e( 'Click me!', 'chisel' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-tertiary"} -->
<div class="wp-block-button is-style-tertiary"><a class="wp-block-button__link wp-element-button"><?php esc_html_e( 'No, click me!', 'chisel' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:cover -->
