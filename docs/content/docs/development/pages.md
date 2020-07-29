---
title: Pages
excerpt: Once your project is setup, you need to add pages, you will be working on, to it.
order: 1200
---

## Adding pages

From the command line type:

```bash
yo chisel:page "Page Name"
```

for example

```bash
yo chisel:page "Home"
```

You can also create multiple pages at once by separating page names with space:

```bash
yo chisel:page "Home" "About Us" "Contact Us" "News"
```

### WordPress Website

When you add a page on WordPress project:

- Twig template is automatically created in `wp/wp-content/themes/[your-theme]/templates/page-{page-slug}.twig`
- Page is accessible at `project-name.test/{page-slug}`
- If you haven't before, flush the rewrite rules _Settings -> Permalinks -> Save changes_

### Front-end templates

When you add a page on front-end templates project, the project index is regenerated and the page is added to it.

## Removing pages

On the front-end templates project you can remove pages by deleting them from `.yo-rc.json` and running `yo chisel:page` (without any page name) to regenerate the project index.
