---
title: WordPress Website Setup
excerpt: How to setup a WordPress website with Chisel
order: 50
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
yo chisel
```

Insert project name (you can use the default one based on the working directory name), author and select *WordPress Website* project type. Decide whether to include jQuery.

Then continue with WordPress setup as follows:

- *Enter title for the new site*: title of your WordPress website
- *Enter URL*: the URL at which your WordPress project runs, currently Chisel only works with the default value (see [#189](https://github.com/xfiveco/generator-chisel/issues/189))
- *Enter admin user*: WordPress admin user, a different name than `admin` is suggested to increase security
- *Enter admin password*: WordPress admin user password
- *Enter admin email*:
- *Where do you want to place the 'src' folder*: position of the src folder with styles, scripts and assets - either the root folder or theme folder
- *Enter the database host*: `127.0.0.1`
- *Enter the database port*: `3306`
- *Enter the database name*: the project database name
- *Enter the database user*: user who can access the database
- *Enter the database password*: password for the user

Select optional plugins which should be installed from the list and wait until installation is complete.

*Note: To speedup installation process we recommend using [Yarn](https://yarnpkg.com/en/). Chisel will automatically detect it and run if possible. Otherwise it falls back to default NPM install*

## 3. Set up virtual host (optional)
We recommend setting up [wildcard virtual hosts](/docs/installation/wildcard-virtual-hosts) so your project domain works out of box.

If you haven’t set them up, you will have to add project domain to your `hosts` file

```bash
127.0.0.1 project-name.test
```

Then use automatically generated `dev-vhost.conf` and add it to the Apache `httpd-vhosts.conf` file or add

```bash
IncludeOptional /path/to/projects/*/dev-vhost.conf
```

in your Apache configuration to automatically load configuration for multiple projects.

## 4. Setting up an existing project
If you are joining development of an existing WordPress project which was already set up with Chisel, you don't have to set it up again. Follow these steps:

1. Clone the repository
1. Create database
1. Run `yo chisel:wp-config`, it will create _wp-config-local.php_ and generate _dev-vhost.conf_ (if you need it)
1. Run `npm install` or `yarn` and `npm run build`
1. Import DB dump or enable _WP Sync DB_ plugin and use it to import database and files. Check out the wiki page explaining how you can [use WP Sync DB plugin to migrate database](https://github.com/xfiveco/generator-chisel/wiki/Setting-up-WordPress-projects-at-Getfives).
