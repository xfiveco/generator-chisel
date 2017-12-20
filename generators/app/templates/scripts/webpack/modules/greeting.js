<% if (has_jquery) { %>import $ from 'jquery';

const greeting = name => {
  const element = $('.js-greeting');

  if (element.length) {
    element.text(name);
  }
};<% } else { %>const greeting = name => {
  const element = document.querySelector('.js-greeting');

  if (element) {
    element.innerHTML = name;
  }
};
<% } %>
export default greeting;
