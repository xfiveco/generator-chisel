const jsdom = require('jsdom');

const creatorData = {
  chiselVersion: '1.0.0-alpha.11',
  app: {
    name: 'Getchisel',
    author: 'Xfive',
    projectType: 'fe',
    browsers: ['modern'],
    nameSlug: 'getchisel',
    hasJQuery: false,
  },
  fe: { additionalFeatures: ['serveDist', 'skipHtmlExtension'] },
};

function containsChild(children, postId) {
  return children.find((child) => {
    let isContain = child.id() === postId;

    if (isContain) return isContain;

    if (child.children()) {
      isContain = containsChild(child.children(), postId);
    }

    return isContain;
  });
}

function sidebarChildren(post, children, getPosts, level = 0) {
  const currentLevel = level + 1;
  const currentPostId = post.id();
  let isActiveParent = false;

  return Promise.all(
    children.map(async (child) => {
      const childChildren = await getPosts(
        { parent: child.id() },
        { 'data.order': 1 },
      );

      const isCurrent = child.id() === currentPostId;

      if (level === 0) {
        isActiveParent = !!containsChild(childChildren, currentPostId);
      }

      return /* HTML */ `
        <li
          class="c-sidebar__child c-sidebar__child--level-${currentLevel}${isCurrent
            ? ' c-sidebar__current'
            : ''}${isActiveParent ? ' c-sidebar__active-parent' : ''}"
        >
          <a class="c-sidebar__link" href="${child.link()}">${child.title()}</a>
          ${childChildren.length > 0
            ? /* HTML */ `
                <ul class="c-sidebar__children o-list-bare">
                  ${await sidebarChildren(
                    post,
                    childChildren,
                    getPosts,
                    currentLevel,
                  )}
                </ul>
              `
            : ''}
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
    buildFormat: 'minify',
    functions: {
      async sidebar({ context: { post }, functions: { getPosts } }) {
        if (!post.id().startsWith('docs')) return '';
        const start = (await getPosts({ id: 'docs' }))[0];
        const children = await getPosts(
          { parent: start.id() },
          { 'data.order': 1 },
        );

        return /* HTML */ `
          <h2 class="c-sidebar__title">
            ${start.title()}
          </h2>

          <ul class="o-list-bare c-sidebar__titles">
            ${await sidebarChildren(post, children, getPosts)}
          </ul>
        `;
      },
      async onPageSidebar({ context: { post } }) {
        if (!post.id().startsWith('docs')) return '';
        const { JSDOM } = jsdom;
        const dom = new JSDOM(post.content());
        const headings = dom.window.document.querySelectorAll('h2');
        if (headings.length <= 0) return '';

        return /* HTML */ `
          <ul class="c-sidebar__headings o-list-bare">
            ${Array.from(headings)
              .map((head) => {
                return `<li>
                <a class="c-page-sidebar__link" href="#${head.id}">
                  ${head.textContent}
                </a>
              </li>`;
              })
              .join('')}
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
};
