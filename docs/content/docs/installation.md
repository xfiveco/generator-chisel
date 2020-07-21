---
title: Installation
order: 20
---

*These installations need to be done just once so you can skip this section if you have the software already installed.*

## Node.js
Install [Node.js](http://nodejs.org/) so you can work with `npm`, Node package manager. Version 6+ is required.

## Yeoman & Chisel
Install [Yeoman](http://yeoman.io/) and Chisel globally. In your [command line](https://webdesign.tutsplus.com/articles/the-command-line-for-web-design-introduction--cms-23493) type:

```bash
npm install -g yo generator-chisel
```

If you want to update your existing Chisel installation to the latest version, run:

```bash
npm update -g generator-chisel
```

## Apache, PHP and MySQL
If you want to develop WordPress projects, you need to install Apache, PHP and MySQL. The easiest option is to use development environments like [MAMP](https://www.mamp.info/en/) or [XAMPP](https://www.apachefriends.org) but you can also customize your [development environment on Mac](https://mallinson.ca/osx-web-development/).

Chisel is using [WP-CLI](http://wp-cli.org/) for most WP-related operations. WP-CLI is using `mysql` and `mysqlcheck` binaries, so you need to have `mysql` and `mysqlcheck` binaries in your `$PATH`.
