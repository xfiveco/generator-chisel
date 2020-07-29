---
title: WordPress Website Setup
excerpt: How to setup a WordPress website with Chisel
order: 500
---

## 1. Create project directory

Create new project directory and change your working directory to it. You can use the following commands on the command line:

```bash
mkdir project-name
cd project-name
```

## 2. Run Chisel

Run Chisel from the project directory:

```bash
chisel create
```

Insert project name (you can use the default one based on the working directory name), author and select _WordPress Website_ project type. Select supported browsers.

Then continue with WordPress setup as follows:

- _Enter title for the new site_: title of your WordPress website
- _Enter URL_: the URL at which your WordPress project runs
- _Enter admin user_: WordPress admin user, a different name than `admin` is suggested to increase security
- _Enter admin password_: WordPress admin user password
- _Enter admin email_

Select optional plugins which should be installed from the list and wait until installation is complete.

After project dependencies are installed and WordPress is downloaded you'll be asked additional questions to configure it (generate `wp-config-local.php`):

- _Enter the database host_: `127.0.0.1`
- _Enter the database port_: `3306`
- _Enter the database name_: the project database name
- _Enter the database user_: user who can access the database
- _Enter the database password_: password for the user

To speedup installation process we recommend using [Yarn](https://yarnpkg.com/en/). Chisel will automatically detect it and run if possible. Otherwise it falls back to default NPM install.

## 3. Set up virtual host

Alternatively, we recommend setting up [wildcard virtual hosts](/docs/installation/wildcard-virtual-hosts) so your project domain works out of box.

If you haven’t set them up, you will have to add project domain to your `hosts` file

```text
127.0.0.1 project-name.test
```

Then use automatically generated `dev-vhost.conf` and add it to the Apache `httpd-vhosts.conf` file or add

```apacheconf
IncludeOptional /path/to/projects/*/dev-vhost.conf
```

in your Apache configuration to automatically load configuration for multiple projects.

## 4. Setting up an existing project

If you are joining development of an existing WordPress project which was already set up with Chisel, you don't have to set it up again. Follow these steps:

1. Clone the repository.
1. Run `npm install` or `yarn` and `npm run build`.
1. Run `npx chisel-scripts wp-config`, it will create the database if necessary and then create _wp-config-local.php_ and generate _dev-vhost.conf_.
1. Import DB dump or enable _WP Sync DB_ plugin and use it to import database and files. Check out the wiki page explaining how you can [use WP Sync DB plugin to migrate database](https://github.com/xfiveco/generator-chisel/wiki/Setting-up-WordPress-projects-at-Getfives).
