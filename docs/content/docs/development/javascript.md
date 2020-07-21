---
title: JavaScript
excerpt: Chisel supports writing modern JavaScript with ES6
order: 160
---

You will write your JavaScript in the `src/sripts` folder which is organized in the following manner:

- `app.js` - entry point file, everything required/imported in this file will be bundled together by [webpack](https://webpack.js.org/)
- `modules` - store your functionality to separate files in this folder and require/import them in the entry point file
- `modules/greeting.js` - a sample JS module, delete or replace this one with your functionality
- `vendor` 

Chisel supports multiple entry points so you can create another files in the `scripts` directory next to `app.js` and they will be bundled separately. You can also use [dynamic imports](https://webpack.js.org/api/module-methods/#import-) to load fragment of code only when you need it.

## Files optimization
JavaScript bundles created when running `npm run build` are minified and file names are revisioned. That means that a content hash is append to the filename so it looks like this `app-93d2daf7a3.bundle.js`. This way you can set up content caching in the far future.

## Code formatting and linting
Check out [Code Quality](/docs/development/code-quality).


