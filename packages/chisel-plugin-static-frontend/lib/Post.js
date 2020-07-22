const { posix } = require('path');
const hexoFrontMatter = require('hexo-front-matter');
const marked = require('marked');
const { omit } = require('lodash');

const rawLoader = require.resolve('./content-raw-loader.js');

module.exports = ({ options, getPostsCreator }) =>
  class Post {
    constructor(post) {
      this._id = post.id;
      this._type = post.type;
      this._title = post.title || '';
      this._data = post.data || {};
      this._contentRaw = post.contentRaw || '';
      this._content = '';
      this._parent = null;
      this._children = [];
      this._loadedContent = '';
      this._file = post.file || '';
    }

    id() {
      return this._id;
    }

    ID() {
      return this.id();
    }

    type() {
      return this._type;
    }

    title() {
      return this._title;
    }

    parent() {
      return this._parent;
    }

    children() {
      return this._children;
    }

    data() {
      return this._data;
    }

    contentRaw() {
      return this._contentRaw;
    }

    content() {
      return this._content;
    }

    link(post) {
      const p = post
        ? posix.join(
            posix.relative(
              posix.dirname(post.link()),
              posix.dirname(this.link()),
            ),
            posix.basename(this.link()),
          )
        : posix.join('/', this._id);

      if (!options.staticFrontend.skipHtmlExtension) {
        return `${p}.html`;
      }

      return p.replace(/\/index$/, '/');
    }

    async adjacent(sort = { id: 1 }, query = {}) {
      // cache?
      const posts = await getPostsCreator()(query, sort);
      const currentIndex = posts.indexOf(this);
      if (currentIndex === -1) return null;
      return posts[currentIndex + 1] || null;
    }

    async next(field = 'data.order') {
      return this.adjacent({ [field]: 1, id: 1 });
    }

    async prev(field = 'data.order') {
      return this.adjacent({ [field]: -1, id: -1 });
    }

    toJSON() {
      const res = {
        id: this.id(),
        title: this._title,
        data: this._data,
        children: this.children().map((child) => child.id()),
        content: this.content(),
        contentRaw: this.contentRaw(),
      };

      if (this._parent) {
        res.parent = this._parent._id;
      }

      return res;
    }

    _setParent(post) {
      this._parent = post;
    }

    _setChildren(posts) {
      this._children = posts;
    }

    _setContent(content) {
      this._content = content;
    }

    loadContent(content) {
      if (content === this._loadedContent) {
        // console.log('Trying to load current content');
        return;
      }

      this._loadedContent = content;

      if (this._type === 'md') {
        const parsedContent = hexoFrontMatter.parse(content);
        this._title = parsedContent.title || '';
        this._data = omit(parsedContent, ['title', '_content']);
        this._contentRaw = parsedContent._content || '';
        this._content = marked(parsedContent._content) || '';
      } else if (this._type === 'json') {
        const parsedContent = JSON.parse(content);
        this._title = parsedContent.title || '';
        this._data = omit(parsedContent, ['title']);
      }
    }

    async loadContentWithLoader(loaderContext) {
      const content = await new Promise((resolve, reject) => {
        loaderContext.loadModule(
          `!!${rawLoader}!${this._file}`,
          (err, source) => {
            if (err) {
              reject(err);
            } else {
              resolve(JSON.parse(source));
            }
          },
        );
      });

      return this.loadContent(content);
    }
  };
