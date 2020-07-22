/* eslint-disable no-console */

const { execSync } = require('child_process');
const { URL } = require('url');
const path = require('path');
const fs = require('fs');

const postsRaw = execSync(
  "curl 'http://getchisel.test/wp-json/wp/v2/pages?per_page=50'",
);
const posts = JSON.parse(postsRaw).filter(
  (post) => post.template !== 'template-home.php',
);

posts.forEach((post) => {
  const link = new URL(post.link);
  const { pathname } = link;
  const file = pathname.slice(-1) === '/' ? pathname.slice(0, -1) : pathname;
  const fileToWrite = `${path.join('./content', path.relative('/', file))}.md`;
  console.log(path.relative('/', file));
  execSync(`mkdir -p '${path.dirname(fileToWrite)}'`);
  const content = post.content.rendered.replace(
    /http:\/\/getchisel.test(\/[^\s)]*)\//g,
    '$1',
  );
  fs.writeFileSync(
    fileToWrite,
    `---
title: ${post.title.rendered}
excerpt: ${post.excerpt.rendered}
order: ${post.menu_order}0
---

${content}
`,
  );
  execSync(`yarn prettier --write '${fileToWrite}'`);
});
