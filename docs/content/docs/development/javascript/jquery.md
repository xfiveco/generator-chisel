---
title: jQuery
excerpt: <a href="https://css-tricks.com/now-ever-might-not-need-jquery/">You might not need jQuery</a>. But if you do, check out some specifics when working with jQuery in Chisel.
order: 1700
---

## Using jQuery plugins with webpack

One of the known issues we encounter while front-end development is usage of the jQuery plugins like `flexslider` alongside webpack module bundler.

The usual solution to that problem can be treated this way:

### 1) Install `jquery` node-module if you haven't done it yet

This is needed because many jQuery plugins have a check if they run inside a module bundler and require `jquery` to be a node-module, but they tend to bind themselves to global `$` object either way.

```bash
npm install --save jquery
```

### 2) Make jQuery global (for various reasons)

```js
window.jQuery = window.$ = require('jquery');
```

### 3) Require plugin

```js
require('flexslider'); // Usually they bind to global jQuery object
```

## Using jQuery and its plugins outside of the webpack bundle

<!-- ```bash
wget https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js
wget https://cdn.jsdelivr.net/npm/select2@4/dist/js/select2.full.min.js
``` -->

From time to time you may stumble upon a legacy jQuery plugin or one which just doesn't want to play nice with webpack. In such a case, you can setup the project to place jQuery and its plugins _outside of the main bundle_.

### Existing project setup

You can try the following steps:

#### 1) Place jquery in assets directory and load it in the template

Download and place jQuery (for example [`jquery.min.js`](https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js)) in the assets directory, then load it in the `layouts/base.twig` before `app.js`:

```twig
<script src="{{ assetPath('jquery/jquery.min.js') }}" defer></script>
<script src="{{ revisionedPath('scripts/app.js') }}" defer></script>
```

> Note: in the above example we additionally created the `jquery` directory in the `assets` directory.

#### 2) Exclude jQuery from webpack

Open up `chisel.config.js` in the root directory and add following function to exported object:

```js
configureWebpack(config) {
  config.externals.push({ jquery: 'window.jQuery' });
},
```

This ensures that when jQuery is imported from one of your JS files, or libraries imported by your JS files it references global jQuery we're loading in the template instead of loading a second copy of jQuery.

### How to use it

This setup will allow you to place plugins inside a special `src/scripts/vendor` directory. Mind they won't be picked up automatically! You need to add the plugin name in the `src/scripts/vendor.json` file. Assuming that you've placed `select2.full.min.js` inside the _vendor_, the _vendor.json_ file should look like this:

When you need to use a jQuery plugin that's not compatible with JS bundling tools you can place them in the assets directory and load them between jQuery and your JS.

```twig
<script src="{{ assetPath('jquery/jquery.min.js') }}" defer></script>
<script src="{{ assetPath('jquery/select2.full.min.js') }}" defer></script>
<script src="{{ revisionedPath('scripts/app.js') }}" defer></script>
```

### Notes

When writing code it's possible to `import $ from 'jquery'` or `var $ = require('jquery')` and **use plugins from the assets** directory.

## Library not available through npm

Place it in assets directory and load in a base layout like demonstrated above.
