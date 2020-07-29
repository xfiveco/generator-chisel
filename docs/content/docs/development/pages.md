---
title: Pages
excerpt: Once your project is setup, you need to add pages, you will be working on, to it.
order: 1200
---

## Adding pages

From the command line type:

```bash
npm run add-page "Page Name"
```

for example

```bash
npm run add-page "Home"
```

You can also create multiple pages at once by separating page names with space:

```bash
npm run add-page "Home" "About Us" "Contact Us" "News"
```

### WordPress Website

When you add a page on WordPress project:

- Twig template is automatically created in `wp/wp-content/themes/[your-theme]/templates/page-{page-slug}.twig`
- Page is accessible at `project-name.test/{page-slug}`
- If you haven't before, flush the rewrite rules _Settings -> Permalinks -> Save changes_

### Static Website

In Static project in creates Twig template in `src/templates` directory or it creates Twig templates or markdown files in `content` directory if it is used. The project index is regenerated (if it's used) and the page is added to it.

## Removing pages

To remove the page remove its template or content file, and remove it from WP Admin or project index if necessary.
