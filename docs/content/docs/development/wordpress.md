---
title: WordPress
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
  &#039;post_title&#039;: &#039;Fake post title&#039;,
  &#039;post_content&#039;: &#039;Fake post content&#039;,
  &#039;_fields&#039;: {
    &#039;special_acf_field&#039;: &#039;field value&#039;
  }
}) %}
```

This will create a `\Chisel\Post` object that you can use like any other post loaded from the database:

```html
&lt;div&gt;
  &lt;h1&gt;{{ post.title }}&lt;/h1&gt;
  &lt;p&gt;{{ post.content }}&lt;/p&gt;
  &lt;p&gt;{{ post.get_field(&#039;special_acf_field&#039;) }}&lt;/p&gt;
&lt;/div&gt;
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
&lt;article class=&quot;c-some-post c-some-post--red c-some-post--type-post&quot;&gt;&lt;/article&gt;
```

`assetPath`: this function returns the real path of the asset file from the `dist/assets` folder.

Example usage:

```twig
&lt;img src=&quot;{{ assetPath(&#039;images/logo.svg&#039;) }}&quot; alt=&quot;{{ site.name }}&quot;&gt;
```

## Good practices
### Use `get_field`
When using ACF try to always use `get_field` method of `Chisel\Post` instead of direct call to the field:

#### Good:
```html
{{ post.get_field(&#039;field_name&#039;) }}
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
&lt;FilesMatch &quot;\.(?i:php)$&quot;&gt;
  Order allow,deny
  Deny from all
&lt;/FilesMatch&gt;
&lt;Files wp-tinymce.php&gt;
  Allow from all
&lt;/Files&gt;
&lt;Files ms-files.php&gt;
  Allow from all
&lt;/Files&gt;
```

#### Protect uploads folder

Add `.htaccess` to the `wp-content/uploads` folder with the following content:

```bash
&lt;FilesMatch &quot;\.(?i:php)$&quot;&gt;
  Order allow,deny
  Deny from all
&lt;/FilesMatch&gt;
```

Note: this can break some plugins
