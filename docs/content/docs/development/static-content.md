---
title: Static Content
excerpt: When working on Static Websites you can leverage content directory to create nested pages structure or generate pages based on Markdown or JSON content
order: 1250
---

By default after creating a Static Website project, new pages are created in the `src/templates` directory. This doesn't support nested pages or doesn't integrate well with rich content (like Markdown).

To support more use cases for Chisel we created an opt-in content experience. To use it you need to create a project top-level `content` directory. Inside this directory, you can create Twig, Markdown, and JSON files.

- Markdown files can contain YAML front matter (block wrapper with triple-dashed lines at the beginning of the file, see example below).
- Markdown and JSON are rendered using templates from the `src/templates` directory, `twig` files are rendered directly.
  - By default `post.twig` template is used.
  - MD & JSON files can define a template to use to render a given file using the `template` property.
- When rendering content `post` object is available (details after example).
- `getPosts` function is available in templates to query all

## Example

Let's create `content/static-content.md` with following content:

```text-md
---
title: Static Content
excerpt: When working on Static Websites you can leverage content directory to create nested pages structure or generate pages based on Markdown or JSON content
order: 1250
---

By default after creating a Static Website project, new pages are created in the `src/templates` directory. This doesn't support nested pages or doesn't integrate well with rich content (like Markdown).
```

And `src/templates/post.twig`:

```twig
{% extends "layouts/base.twig" %}
{% block content %}
  <article>
    <h1>{{ post.title }}</h1>
    <p>{{ post.data.excerpt }}</p>
    <div>{{ post.content }}</div>
  </article>
{% endblock %}
```

As we can see, all of the content from our markdown file is available for us in the template. Everything from front matter (or JSON content) is available as a `post.data` object. The title is aliased for convenience. Some other properties (like `template` or `order`) may have special meaning but they are available in the data object. Markdown document content is available, converted to HTML, as `post.content`.

## `post` object

`post` object is available in templates when rendering content pages with data for the current page. Array of `post` objects is returned by `getPosts` function.

> Note that when you're using post object in custom Twig functions the propertied documented below are functions. Some may also be async functions (returning Promise).

### `post.id` / `post.ID`

ID is a path to the post without extension.

### `post.type`

One of: `twig`, `md`, `json`.

### `post.title`

Alias for `post.data.title` or empty string.

### `post.parent`

Parent post object, null when there is no parent, this may be true for top-level files, but also when there is no direct parent page, for example `nested/hello` page exists but not `nested`.

### `post.children`

Child posts array.

### `post.data`

All the content from the Markdown or JSON file is stored in `post.data`

### `post.contentRaw` / `post.content`

In Markdown files `content` contains main document content converted to HTML, `contentRaw` original Markdown content. In other types, both are empty strings.

### `post.link` / `post.link(otherPost)`

Returns link to the post, absolute by default, relative to `otherPost` if passed. The link may have an `html` extension depending on the configuration.

`postLink` function (`postLink(otherPost)`) is available to generate link relative to current post, shortHand to `otherPost.link(post)`.

### `post.adjacent(sort, query)`, `post.prev`, `post.prev(field)` `post.next`, `post.next(field)

Adjacent return adjacent post based on given sort order and query.

Prev/next return previous or next post sorted by given field (`data.order` by default) and ID as a secondary sort field.

## `getPosts(query, sort)` function

Allows to query all pages available on the site. Internal store is based on [NeDB](https://github.com/louischatriot/nedb). Please check [its documentation for querying](https://github.com/louischatriot/nedb#finding-documents) to learn more.

For example `getPosts({ parent: { '$exists': false } }, { 'data.order': 1 })` would search for documents that have no parents and sort them by `order` field.

## Development limitations

When running the development server all changes to existing documents should be applied and the page reloaded but additions, removals, and renames of existing documents are not supported at this time and require a manual restart of the dev server.
