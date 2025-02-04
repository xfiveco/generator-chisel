const loaded = () => {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('has-loaded');
  });
};

export default loaded;
