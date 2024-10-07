const scrollbarWidth = () => {
  setTimeout(() => {
    const width = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', `${width}px`);
  }, 10);
};

export default scrollbarWidth;
