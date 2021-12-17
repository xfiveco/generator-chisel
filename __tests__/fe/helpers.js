const defaultAnswers = [
  null,
  {
    app: {
      name: 'FrontEnd',
      author: 'Xfive Tester',
      projectType: 'fe',
      browsers: ['modern'],
    },
  },
  {
    fe: {
      additionalFeatures: [],
    },
  },
];

const somePageSimple = `
{% extends "layouts/base.twig" %}
{% set pageName = 'Some Page' %}
{% block content %}
  <h1>Hello <span class="js-greeting"></span></h1>
{% endblock %}
`;

module.exports.defaultAnswers = defaultAnswers;
module.exports.somePageSimple = somePageSimple;
