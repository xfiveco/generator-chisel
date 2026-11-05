# <%= app.name %>

<%= app.name %> is a project created with Chisel. Please check out Chisel documentation at [https://www.getchisel.co/docs/](www.getchisel.co/docs/).
<% const siteUrl = wp.url.replace(/\/$/, ''); %>
## Joining the project

Based on the Chisel [Existing Project](https://getchisel.co/docs/installation-setup/) guide.

Requirements: Node.js 20+, PHP 8.2+, Composer, and a local server serving the site at `<%= siteUrl %>`.

1. Clone the repository and go to the theme folder:

   ```bash
   git clone <repository-url>
   cd <project-folder>/<%= app.themePath %>
   ```

2. Install dependencies:

   ```bash
   composer install
   npm install
   ```

3. Configure WordPress:
   - Copy `wp-config-custom.php` and rename the copy to `wp-config.php` (it is gitignored).
   - From the theme folder run `npm run wp-config`. It creates `wp-config-local.php` with your database details.
   - Make sure `wp-config-local.php` has these local development settings:

     ```php
     define( 'WP_DEBUG', true );
     define( 'WP_DEBUG_LOG', true );
     define( 'WP_DEBUG_DISPLAY', false );

     // Required for the theme fast refresh mode.
     define( 'SCRIPT_DEBUG', true );
     define( 'WP_ENVIRONMENT_TYPE', 'development' );
     ```

4. Build assets:

   ```bash
   npm run build
   ```

5. Start development:

   ```bash
   npm run dev
   ```

   The site runs at `<%= siteUrl %>` with fast refresh for CSS and JavaScript.

If something goes wrong, see the [Troubleshooting](https://getchisel.co/docs/installation-setup/) section of the Chisel docs.
<% if ((creatorData.wpPlugins?.plugins || []).includes('xfive MCP')) { %>
## Using the xfive MCP plugin locally

The `xfive-mcp` plugin lets AI tools (Claude Code and others) read and edit site content. Point your AI tool at `<%= siteUrl %>/wp-json/xfive-mcp/mcp` (see `wp-content/plugins/xfive-mcp/README.md` for setup). Make sure the plugin is activated in WP admin, then add the following to `wp-config-local.php`.

### Local access without a password

```php
// MCP Auth open mode for xfive-mcp plugin
define( 'MCP_OPEN', true );
```

This lets the AI tool connect to your local site without a login. It acts as the first administrator user. Use it only in `wp-config-local.php`, never on staging or production.

### Pushing media to staging (optional)

Only needed if you use the `media-migrate` tool to copy images and files from your local site to staging.

```php
// Target for the xfive-mcp Media - Migrate tool (local to staging)
define( 'XFIVE_MCP_REMOTE_URL', '<staging-url>' );
define( 'XFIVE_MCP_REMOTE_USER', '<staging-username>' );
define( 'XFIVE_MCP_REMOTE_APP_PASSWORD', '<staging-application-password>' );
```

The application password belongs to a staging user who can upload files. Ask the team for it, or create one on staging under *Users > Profile > Application Passwords*. Never commit it.
<% } %>
