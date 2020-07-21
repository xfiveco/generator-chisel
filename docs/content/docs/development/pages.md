---
title: Pages
order: 120
---

## Adding pages
From the command line type:

```bash
yo chisel:page &quot;Page Name&quot;
```

for example

```bash
yo chisel:page &quot;Home&quot;
```

You can also create multiple pages at once by separating page names with space:

```bash
yo chisel:page &quot;Home&quot; &quot;About Us&quot; &quot;Contact Us&quot; &quot;News&quot;
```

### WordPress Website
When you add a page on WordPress project:

- Twig template is automatically created in `wp/wp-content/themes/[your-theme]/templates/page-{page-slug}.twig`
- Page is accessible at `project-name.test/{page-slug}`

### Front-end templates
When you add a page on front-end templates project, the project index is regenerated and the page is added to it.

## Removing pages
On the front-end templates project you can remove pages by deleting them from `.yo-rc.json` and running `yo chisel:page` (without any page name) to regenerate the project index.


