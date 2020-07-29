const greeting = (name) => {
  const element = document.querySelector('.js-greeting');

  if (element) {
    element.innerHTML = name;
  }
};

export default greeting;
