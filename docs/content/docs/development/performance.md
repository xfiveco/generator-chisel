---
title: Performance
excerpt: Chisel aims to offer great performance out-of-box. The rest is up to you.
order: 1900
---

## JavaScript

JavaScript bundle is minified and deferred.

The file name is revisioned. A content hash is appended to the filename (eg. `app.7ea16125.js`) so you can set up content caching in the far future.

## CSS

CSS styles are concatenated to one file and minified.

The file name is revisioned. A content hash is appended to the filename (eg. `main.6a889b04.css`) so you can set up content caching in the far future.

## WordPress

- jQuery is not included by default
- [Disable Emojis](https://wordpress.org/plugins/disable-emojis/) plugin is installed
- static resources (CSS, JS, images) are served with far-future expires headers to leverage browser caching
- we recommend using WordPress hosting which uses a proxy cache (eg. [Pantheon](https://pantheon.io/)) or a cache plugin which generates static HTML files like [WP Rocket](https://wp-rocket.me/)
