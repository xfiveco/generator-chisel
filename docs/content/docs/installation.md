---
title: Installation
excerpt: The following software needs to be installed if you want to setup and develop projects with Chisel
order: 200
---

_These installations need to be done just once so you can skip this section if you have the software already installed._

## Node.js

Install [Node.js](https://nodejs.org/) so you can work with `npm`, Node package manager. Version 10.14.2+ or 12+ is required.

## Chisel

Install Chisel globally. In your [command line](https://webdesign.tutsplus.com/articles/the-command-line-for-web-design-introduction--cms-23493) type:

```bash
yarn global add generator-chisel
# or
npm -g install generator-chisel
```

If you want to update your existing Chisel installation to the latest version, also run:

```bash
yarn global add generator-chisel
# or
npm -g install generator-chisel
```

## Apache, PHP, and MySQL

If you want to develop WordPress projects, you need to install Apache, PHP, and MySQL. The easiest option is to use development environments like [MAMP](https://www.mamp.info/en/) or [XAMPP](https://www.apachefriends.org). If using MAMP, check _Allow network access to MySQL_.

If you are on macOS, we recommend to install necessary packages with Homebrew according to the following guides:

- [macOS 11.0 Big Sur Apache Setup: Multiple PHP Versions](https://getgrav.org/blog/macos-bigsur-apache-multiple-php-versions) - skip multiple PHP versions installation if you want
- [macOS 11.0 Big Sur Apache Setup: MySQL, Xdebug & More...](https://getgrav.org/blog/macos-bigsur-apache-mysql-vhost-apc) - you can skip YAML and Xdebug installation

### Known Issues

#### Error: Too many positional arguments: 1

If you run `chisel create` command on Windows with npm v6 installed, the project creation may end with this error when attempting to set up database. The issue can be resolved by updating npm or using Yarn.

#### `mysql` or `mysqlcheck` not found

Chisel is using [WP-CLI](https://wp-cli.org/) for most WP-related operations. WP-CLI is using `mysql` and `mysqlcheck` binaries, so check out if you have `mysql` and `mysqlcheck` binaries in your `$PATH` by running the following commands:

```bash
mysql --version
mysqlcheck --version
```

## Problems with installation?

[Submit an issue](https://github.com/xfiveco/generator-chisel/issues) at GitHub with a label `question` or write us to the e-mail [chisel@xfive.co](mailto:chisel@xfive.co). We are happy to help.
