---
title: WordPress
excerpt: Chisel supports easy and fast theme development with <a href="https://www.upstatement.com/timber/">Timber</a>. Chisel's starter theme helps you organize project functionality in a logical, maintainable way.
order: 140
---

## Creating theme front-end
Chisel allows easy front-end development prior to WordPress development. Suppose you have 3 pages to develop front-end for `Team`, `Team Member`, `Contact`.

1. Add these pages from the command line like described in the previous sections
2. Now your pages are accessible under `project-name.test/team/`, `project-name.test/team-member/` and `project-name.test/contact/`.
3. Start adding HTML to relevant Twig templates. Where applicable try to use [Twig syntax](http://twig.sensiolabs.org/doc/templates.html)
4. Create styles in `src/styles`.
5. Once you are done with front-end development a WordPress developer will add required functionality

## Developing theme functionality

Inside the theme there is `Chisel` folder with various classes which extend WordPress or add theme functionality. It's recommended to follow the existing structure and update these classes or add new classes here instead of adding functionality directly to `functions.php`.

Classes you can work with:

### `\Chisel\Media.php`
Default media settings for Chisel, you can change or extend media settings here.

### `\Chisel\Post.php` 
This class extends `\Timber\Post` class

### `\Chisel\Performance.php` 
Class for optimizing performance, allows to setup which JS scripts should be deferred or asynced
### `\Chisel\Site.php`
This class extends `\Timber\Site` class and is used to setup whole site related configuration

### `\Chisel\Security.php`
Default security settings for Chisel, you can change or extend security settings here

### `\Chisel\Extensions\DataType.php` 
Use this class to register custom post types and taxonomies

### `\Chisel\Extensions\Twig.php`
Use this class to extend Twig functionality

### `\Chisel\Extensions\Theme.php`
Use this class to extend theme functionality

If you want to add new custom class, you can copy and adjust one of the existing classes. Then load your class in `functions.php`

Refer to [Timber](http://upstatement.com/timber/) documentation if you are new to WordPress development with Timber.

## Built-in extensions for Timber

### `ChiselPost`
You can use this function if you want to create a post class inside Twig file. As an argument you can pass post id, post object, or an array consisting of field values for the post. When creating fake post by passing an array of fields as an argument you can use `_fields` key to set post meta values loaded via `get_field` method to simulate for example ACF values. You can also load existing post that will have fake fields by passing post's id with `ID` key:

Example usage:

```php
{% set post = ChiselPost({
  'post_title': 'Fake post title',
  'post_content': 'Fake post content',
  '_fields': {
    'special_acf_field': 'field value'
  }
}) %}
```

This will create a `\Chisel\Post` object that you can use like any other post loaded from the database:

```html
<div>
  <h1>{{ post.title }}</h1>
  <p>{{ post.content }}</p>
  <p>{{ post.get_field('special_acf_field') }}</p>
</div>
```

### `className`
You can use this function if you want to avoid writing long classes with multiple modifiers by hand:

Example usage:

```php
<article class="{{
  className(
    'c-some-post',
    'red',
    'type-' ~ post.type,
    (post.thumbnail ? 'has-thumbnail')
  )
}}"></article>
```

It will generate (assuming post of type `post` and no thumbnail):

```html
<article class="c-some-post c-some-post--red c-some-post--type-post"></article>
```

`assetPath`: this function returns the real path of the asset file from the `dist/assets` folder.

Example usage:

```twig
<img src="{{ assetPath('images/logo.svg') }}" alt="{{ site.name }}">
```

## Good practices
### Use `get_field`
When using ACF try to always use `get_field` method of `Chisel\Post` instead of direct call to the field:

#### Good:
```html
{{ post.get_field('field_name') }}
```

#### Bad:
```html
{{ post.field_name }}
```

Read more on the topic in [ACF Cookbook](https://timber.github.io/docs/guides/acf-cookbook/)

### Security
In addition to default security settings you can also:

#### Protect WP includes

Add `.htaccess` to the `wp-includes` folder with the following content:

```bash
<FilesMatch "\.(?i:php)$">
  Order allow,deny
  Deny from all
</FilesMatch>
<Files wp-tinymce.php>
  Allow from all
</Files>
<Files ms-files.php>
  Allow from all
</Files>
```

#### Protect uploads folder

Add `.htaccess` to the `wp-content/uploads` folder with the following content:

```bash
<FilesMatch "\.(?i:php)$">
  Order allow,deny
  Deny from all
</FilesMatch>
```

Note: this can break some plugins

## Common issues
### Gravity Forms JavaScript issues
If you encounter Gravity Forms JavaScript issues which might be related to Chisel using a `defer` tag, check out [this workaround](https://bjornjohansen.no/load-gravity-forms-js-in-footer).
