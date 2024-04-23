const jmespath = require("jmespath");
const UserConfig = require("@11ty/eleventy").UserConfig;

/** @param {UserConfig} eleventyConfig */
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static/*/*");

  eleventyConfig.addFilter("jmespath", (data, query) => {
    return jmespath.search(data, query);
  });

  global.filters = eleventyConfig.javascriptFunctions;
  eleventyConfig.setPugOptions({
    globals: ['filters']
  });

  return {
    dir: {
      input: "views"
    }
  }
}
