---
title: Static Website  Setup
excerpt: How to setup static website with Chisel
order: 600
---

## 1. Create project directory

Create a new project directory and change your working directory to it. You can use the following commands on the command line:

```bash
mkdir project-name
cd project-name
```

## 2. Run Chisel

Run Chisel from the project directory

```bash
chisel create
```

Insert project name (you can use the default one based on the working directory name), author and select _Front-end Templates_ project type. Select browsers you're supporting, optional additional features (see below) and wait until installation completes.

Additional features are available during installation, they can be also enabled later in `chisel.config.js`:

- _Serve dist directory in dev / don't generate pages index_: by default chisel generates index page with pages you create outside of the dist directory, this may be useful when you're working on static templates that somebody will later work on (for example different developer will integrate with backend). If you're working on a _website_ that'll be deployed from Chisel project it's probably good to enable this to match dev server behavior with deployed site.
- _Don't include html extension in links (posts API) & support them in dev_: When enabled dev server will support urls without html extension. Additionally, when working with [content](/docs/development/static-content) html extension will be omitted from generated links.

> To speedup installation process we recommend using [Yarn](https://yarnpkg.com/en/). Chisel will automatically detect it and run if possible. Otherwise it falls back to default NPM install

## 3. Setting up an existing project

If you are joining development of an existing front-end project which was already set up with Chisel, you don't have to set it up again. Follow these steps:

1. Clone repository
2. Run `npm install` or `yarn`
3. Run `npm run build` and `npm run dev`
