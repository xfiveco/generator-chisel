const {
  cloneDeepWith,
  has,
  omit,
  isPlainObject,
  toPairs,
  fromPairs,
} = require('lodash');

module.exports = ({ db, postsMap }) => (loader = null) => async (
  query = {},
  sort = { id: 1 },
) => {
  if (typeof query === 'string') {
    query = JSON.parse(query);
  }

  // twig doesn't keep doesn't od properties in object, but they provide
  // _keys array with order
  const cloneCustomizer = (val) => {
    if (isPlainObject(val) && has(val, '_keys')) {
      const keys = val._keys;
      return cloneDeepWith(
        fromPairs(
          toPairs(omit(val, ['_keys'])).sort(
            ([key1], [key2]) => keys.indexOf(key1) - keys.indexOf(key2),
          ),
        ),
        cloneCustomizer,
      );
    }

    return undefined;
  };

  const queryWithoutKeys = cloneDeepWith(query, cloneCustomizer);
  const sortWithoutKeys = cloneDeepWith(sort, cloneCustomizer);

  if (!loader) {
    return (await db.find(queryWithoutKeys).sort(sortWithoutKeys)).map(
      ({ id }) => postsMap[id],
    );
  }

  const postsRaw = await db.find(queryWithoutKeys);

  const posts = postsRaw.map(({ id }) => postsMap[id]);

  posts.forEach((loopPost) => {
    if (loopPost._file) {
      loader.addDependency(loopPost._file);
    }
  });

  await Promise.all(
    posts.map((loopPost) => loopPost.loadContentWithLoader(loader)),
  );

  await Promise.all(
    posts.map((loopPost) =>
      db.update({ id: loopPost.id() }, loopPost.toJSON()),
    ),
  );

  // we may update data that impacts query or sorting order
  const postsRaw2 = await db.find(queryWithoutKeys).sort(sortWithoutKeys);

  return postsRaw2.map(({ id }) => postsMap[id]);
};
