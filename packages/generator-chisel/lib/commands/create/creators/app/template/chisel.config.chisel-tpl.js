/* eslint-disable no-param-reassign */

const creatorData = <%= JSON.stringify(creatorData) %>;

<%
  const isWP = app.projectType == 'wp-with-fe';
  const isFE = app.projectType == 'fe';
  if(isWP) {
    let url = /^https?:\/\//.test(wp.url) ? wp.url : `http://${wp.url}`;
    if(url.endsWith('/')) url = url.slice(0, -1);
    print(`const wp = {
      directoryName: 'wp',
      themeName: '${app.nameSlug}-chisel',
      url: ${JSON.stringify(url)},
    }`);
  }
%>

module.exports = {
  creatorData,

  <%= !isWP ? '' : `
  wp,

  output: {
    base: \`\${wp.directoryName}/wp-content/themes/\${wp.themeName}/dist\`
  },` %>

  <%= !isFE ? '' : `
  staticFrontend: {
    serveDist: ${String(fe.additionalFeatures.includes('serveDist'))},
    skipHtmlExtension: ${String(fe.additionalFeatures.includes('skipHtmlExtension'))},
  },
  `  %>

  // To use React and hot reload for React components:
  // 1. Run `yarn add react-hot-loader @hot-loader/react-dom`
  // 3. Mark your root component as hot-exported as described on
  //    https://github.com/gaearon/react-hot-loader#getting-started (step 2)
  // 4. Uncomment line below
  // react: true,

  plugins: [
    'chisel-plugin-code-style',
    <%= isWP ? "'chisel-plugin-wordpress'," : '' %>
    <%= isFE ? "'chisel-plugin-static-frontend'," : '' %>
  ],
}
