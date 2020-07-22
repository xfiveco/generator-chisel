---
title: jQuery
excerpt: <a href="https://css-tricks.com/now-ever-might-not-need-jquery/">You might not need jQuery</a>. But if you do, check out some specifics when working with jQuery in Chisel.
order: 1700
---

## Using jQuery plugins with webpack

One of the known issues we encounter while front-end development is usage of jQuery plugins like `flexslider` alongside webpack module bundler.

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

## Using jQuery and its plugins outside of webpack bundle

From time to time you may stumble upon legacy jQuery plugin or one which just doesn't want to play nice with webpack. In such case you can setup the project to place jQuery and its plugins _outside of the main bundle_.

### New project setup

Make sure to _Include jQuery_ and then agree to _configure vendor bundle for jQuery plugins_.

```bash
? Include jQuery? Yes
? Would you like to configure vendor bundle for jQuery plugins? Yes
```

### Existing project setup

You can try following steps:

#### 1) Check if jQuery is installed

In case it isn't go ahead with `yarn add jquery` or `npm install jquery --save` depending on which tool you use.

#### 2) Exclude jQuery from webpack

Open up `webpack.chisel.config.js` in the root directory and make sure following entry is present:

```js
externals: {
  jquery: 'window.jQuery',
},
```

#### 3) Add path to jQuery

Make sure that path to jQuery is present in `vendor.json`:

```json
["/node_modules/jquery/dist/jquery.js"]
```

### How to use it

This setup will allow you to place plugins inside special `src/scripts/vendor` directory. Mind they won't be picked up automatically! You need to add the plugin name in the `src/scripts/vendor.json` file. Assuming that you've placed `select2.full.min.js` inside the _vendor_, the _vendor.json_ file should look like this:

```bash
[
  "/node_modules/jquery/dist/jquery.js",
  "select2.full.min.js"
]
```

So, to recap:

1. Make sure to you've got jQuery installed.
2. Place the plugin script inside `src/scripts/vendor`.
3. Add its name inside `src/scripts/vendor.json`.
4. Enjoy ;)

### Notes

- It's enough to add _full file name_ inside _vendor.json_. There's no need to add full path to it if the script has been placed inside `src/scripts/`.
- Removing `"/node_modules/jquery/dist/jquery.js"` path will get rid of jQuery.
- It's possible to refer plugins installed via NPM or Yarn using appropriate path – just like in the jQuery example: `"/node_modules/[plugin name]/[plugin-file.js]"`
- When writing code it's possible to `import $ from jQuery` or `var $ = require('jquery')` and **use plugins from the vendor** directory.
- This setup will create additional JS file called `vendor.js`. It'll be placed in `dist/scripts` just like the bundle file.

## Library not available through npm

Use [`externals` option in webpack configuration](https://webpack.js.org/configuration/externals/). You can also try vendor plugins setup as decribed above.
