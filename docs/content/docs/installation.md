---
title: Installation
excerpt: The following software needs to be installed if you want to setup and develop projects with Chisel
order: 20
---

*These installations need to be done just once so you can skip this section if you have the software already installed.*

## Node.js
Install [Node.js](http://nodejs.org/) so you can work with `npm`, Node package manager. Version 6 or 8+ is required. Node 7 is not supported.

## Yeoman & Chisel
Install [Yeoman](http://yeoman.io/) and Chisel globally. In your [command line](https://webdesign.tutsplus.com/articles/the-command-line-for-web-design-introduction--cms-23493) type:

```bash
npm install -g yo generator-chisel
```

If you want to update your existing Chisel installation to the latest version, run:

```bash
npm install -g generator-chisel
```

## Apache, PHP and MySQL
If you want to develop WordPress projects, you need to install Apache, PHP and MySQL. The easiest option is to use development environments like [MAMP](https://www.mamp.info/en/) or [XAMPP](https://www.apachefriends.org). If using MAMP, check *Allow network access to MySQL*.

If you are on macOS, we recommend to install necessary packages with Homebrew according the following guides:

* [macOS 10.14 Mojave Apache Setup: Multiple PHP Versions](https://getgrav.org/blog/macos-mojave-apache-multiple-php-versions) - skip multiple PHP versions installation if you want
* [macOS 10.14 Mojave Apache Setup: MySQL, APC & More...](https://getgrav.org/blog/macos-mojave-apache-mysql-vhost-apc) - you can skip YAML and Xdebug installation

### Known Issues
#### `mysql` or `mysqlcheck` not found
Chisel is using [WP-CLI](http://wp-cli.org/) for most WP-related operations. WP-CLI is using `mysql` and `mysqlcheck` binaries, so check out if you have `mysql` and `mysqlcheck` binaries in your `$PATH` by running the following commands:

```bash
mysql --version
mysqlcheck --version
```

#### MySQL 8 authentication method not supported
If you happen to be using MySQL 8 with Chisel, you may encounter an error when trying to setup a project. `mysqljs` library used by Chisel doesn't support default authentication method of MySQL 8 yet.

You can verify what method MySQL is using by running:

```bash
mysql -u root -p
USE mysql
SELECT host, user, plugin, authentication_string FROM user WHERE user='root';
```

If the result lists `auth_socket`, Chisel project setup won't work. You can update authentication method by running the following commands:

```bash
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '[enter your password]';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY ' [enter your password] ';
```

Alternative, switch to MariaDB or MySQL 5.

## Problems with installation?
[Submit an issue](https://github.com/xfiveco/generator-chisel/issues) at GitHub with a label `question` or write us to the e-mail [chisel@xfive.co](mailto:chisel@xfive.co). We are happy to help.
