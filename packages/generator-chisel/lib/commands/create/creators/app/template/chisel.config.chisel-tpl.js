const creatorData = <%= JSON.stringify(creatorData) %>;

<%
  const isWP = app.projectType == 'wp-with-fe';
  let url = /^https?:\/\//.test(wp.url) ? wp.url : `http://${wp.url}`;
  if(url.endsWith('/')) url = url.slice(0, -1);
  if(isWP) {
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

  // To use React and hot reload for react components:
  // 1. Run `yarn add react-hot-loader @hot-loader/react-dom`
  // 3. Mark your root component as hot-exported as described on
  //    https://github.com/gaearon/react-hot-loader
  // 4. Uncomment line below
  // react: true,

  plugins: [
    'chisel-plugin-code-style',
    <%= isWP ? "'chisel-plugin-wordpress'," : '' %>
  ]
}
