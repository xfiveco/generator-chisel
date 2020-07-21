const creatorData = {
  chiselVersion: '1.0.0-alpha.8',
  app: {
    name: 'Getchisel',
    author: 'Xfive',
    projectType: 'fe',
    browsers: ['modern', 'edge18', 'ie11'],
    nameSlug: 'getchisel',
    hasJQuery: false,
  },
  fe: { additionalFeatures: ['serveDist', 'skipHtmlExtension'] },
};

function sidebarChildren(post, children, getPosts) {
  return Promise.all(
    children.map(async (child) => {
      const childChildren = await getPosts(
        { parent: child.id() },
        { 'data.order': 1 },
      );
      const isCurrent = child.id() === post.id();

      return /* HTML */ `
        <li${isCurrent ? ' class="current_page_item"' : ''}>
          <a href="${child.link()}">${child.title()}</a>
          ${
            childChildren.length > 0
              ? /* HTML */ `
                  <ul class="children">
                    ${await sidebarChildren(post, childChildren, getPosts)}
                  </ul>
                `
              : ''
          }
        </li>
      `;
    }),
  ).then((strings) => strings.join('\n'));
}

module.exports = {
  creatorData,

  staticFrontend: {
    serveDist: true,
    skipHtmlExtension: true,
    functions: {
      async sidebar({ context: { post }, functions: { getPosts } }) {
        const start = (await getPosts({ id: 'docs' }))[0];
        const children = await getPosts(
          { parent: start.id() },
          { 'data.order': 1 },
        );

        return /* HTML */ `
          <h2 class="c-sidebar__title">
            ${start.title()}
            <div class="c-sep c-sep--dark"></div>
          </h2>

          <ul>
            ${await sidebarChildren(post, children, getPosts)}
          </ul>
        `;
      },
    },
  },

  // To use React and hot reload for react components:
  // 1. Run `yarn add react-hot-loader @hot-loader/react-dom`
  // 3. Mark your root component as hot-exported as described on
  //    https://github.com/gaearon/react-hot-loader
  // 4. Uncomment line below
  // react: true,

  plugins: ['chisel-plugin-code-style', 'chisel-plugin-static-frontend'],

  // https://cli.vuejs.org/config/#configurewebpack
  // configureWebpack(config) {},
  // chainWebpack(config) {},

  // Hooks can be used to change internal behavior, for example:
  // documentation TBD :(
  // hooks: {
  //   wordPress: {
  //     browserSyncConfig(config) {
  //       // disable opening of browser window when dev server starts
  //       // eslint-disable-next-line no-param-reassign
  //       config.open = false;
  //     },
  //   },
  // },
};
