const { defaultAnswers } = require('../helpers');

const postPageSimple = (extra = '') => `
<h1>Hello {{ post.title }}</h1>
<div>{{ post.content }}</div>
${extra}
`;

const md = (title, content = '', extra = '') =>
  `
---
title: ${title}
${extra}
---

${content}
`.substr(1);

module.exports.defaultAnswers = defaultAnswers;
module.exports.postPageSimple = postPageSimple;
module.exports.md = md;
