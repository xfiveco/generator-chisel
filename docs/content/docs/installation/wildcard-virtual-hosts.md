---
title: Wildcard virtual hosts
excerpt: This step is optional but highly recommended if you develop WordPress projects
order: 300
---

It will ensure that each new local development domain will work out of the box on your computer and you won’t have to edit `hosts` and `httpd-vhosts.conf` files every time. This is achieved by setting up wildcard virtual hosts and DNS.

## macOS

Throughout this guide, we assume that your username is `developer` and you store your projects inside `~/Projects` directory.

Based on an awesome tutorial from [Chris Mallinson](https://mallinson.ca/osx-web-development/).

This tutorial assumes you have MySQL and Apache installed (they come by default with macOS). If you use MAMP, use it as you like, but this tutorial aims for a built-in Apache & MySQL setup. You can find additional information about where MAMP stores its config files [in this article](https://dev.to/crankysparrow/configuring-virtual-hosts-with-mamp-f3i).

Make sure you have Xcode (`xcode-select --install`) and [brew](https://brew.sh/) installed.

### 1. Install and setup `dnsmasq`

This is for `*.test` domain wildcarding:

```bash
brew install dnsmasq
cd $(brew --prefix); mkdir etc; echo 'address=/.test/127.0.0.1' > etc/dnsmasq.conf
sudo cp -v $(brew --prefix dnsmasq)/homebrew.mxcl.dnsmasq.plist /Library/LaunchDaemons
sudo launchctl load -w /Library/LaunchDaemons/homebrew.mxcl.dnsmasq.plist
sudo mkdir /etc/resolver
sudo bash -c 'echo "nameserver 127.0.0.1" > /etc/resolver/test'
```

### 2. Edit `/etc/apache2/httpd.conf`

Uncomment the line (remove `#`):

```bash
LoadModule vhost_alias_module libexec/apache2/mod_vhost_alias.so
```

### 3. Edit `/etc/apache2/extra/httpd-vhosts.conf`

Add VirtualHost config.

Reminder – we are assuming your username is `developer` and your store projects inside `~/Projects` directory.

```apacheconf
<VirtualHost *:80>
  ServerAlias localhost *.test
  # Chisel stores WP inside wp folder in the root of your project
  VirtualDocumentRoot /Users/developer/Projects/%1/wp
  UseCanonicalName Off
  <Directory "/Users/developer/Projects">
    Options FollowSymLinks
    AllowOverride All
    Order allow,deny
    Allow from all
    Require all granted
  </Directory>
</VirtualHost>
```

### 4. Restart Apache

```bash
sudo apachectl restart
```

## Linux

Follow the article here: [https://brunodbo.be/blog/2013/04/26/setting-up-wildcard-apache-virtual-host-wildcard-dns](https://web.archive.org/web/20200219082058/http://brunodbo.be/blog/2013/04/26/setting-up-wildcard-apache-virtual-host-wildcard-dns).

## Windows

### 1. Install and setup Acrylic DNS Proxy

This is for `*.test` domain wildcarding

Download and install [Acrylic DNS Proxy](https://mayakron.altervista.org/wikibase/show.php?id=AcrylicHome), then set it up at your system, eg. [Windows 10](http://mayakron.altervista.org/support/acrylic/Windows10Configuration.htm).

Add `127.0.0.1 *.test` to **AcrylicHosts.txt** file so it looks like:

```text
127.0.0.1 localhost localhost.localdomain
::1 localhost localhost.localdomain
127.0.0.1 *.test
```

### 2. Edit `httpd.conf`

If you are using [XAMP](https://www.apachefriends.org/) it would be located in `c:\xampp\apache\conf`. Uncomment the line (remove `#`):

```apacheconf
LoadModule vhost_alias_module modules/mod_vhost_alias.so
```

### 3. Edit `httpd-vhosts.conf`

If you are using [XAMP](https://www.apachefriends.org/) it would be located in `c:\xampp\apache\conf\extra`. Add VirtualHost config:

```apacheconf
<Directory "C:/xampp/xampp/htdocs/">
    Options Indexes FollowSymLinks Includes ExecCGI
    AllowOverride All
    Order allow,deny
    Allow from all
</Directory>

<VirtualHost *:80>
    ServerName localhost
    ServerAlias localhost
    DocumentRoot c:/xampp/htdocs/
</VirtualHost>

<VirtualHost *:80>
    ServerAlias *.test
    # notice wp at the end, that's because Chisel serves WP from a subfolder
    VirtualDocumentRoot c:/xampp/htdocs/%-1/%-2+/wp
</VirtualHost>
```

### 4. Restart Apache

Restart Apache from the XAMPP control.

## You're all set up!

Now your projects inside `~/Projects` directory (`c:\xampp\htdocs\test` on Windows) will directly map to `*.test` host, so:

- `/User/developer/Projects/testproject` (`c:\xampp\htdocs\test\testproject`) will be available under `https://testproject.test`
- `/User/developer/Projects/mywork` (`c:\xampp\htdocs\test\mywork`) will be available under `https://mywork.test`

And so on. Chisel will set up BrowserSync proxy for you under `your-project-name.test` address. It's advisable that you name your project (during `chisel create` command) exactly the same as the directory you're in, so there's no need for you to configure anything.
