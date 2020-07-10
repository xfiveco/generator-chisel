module.exports = function stringLoader(content) {
  // console.log(`Raw loader for ${this.resourcePath}`);
  return JSON.stringify(content);
};
