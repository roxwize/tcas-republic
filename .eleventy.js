const jmespath = require("jmespath");
const UserConfig = require("@11ty/eleventy").UserConfig;

const members = require("./views/_data/members.json");

function get_election_year() {
  const now = new Date(Date.now());
  if (now.getUTCMonth() >= 5 && now.getUTCDay() >= 7) return now.getUTCFullYear();
  else return now.getUTCFullYear() - 1;
}
/** @param {string} uname */
const url_friendly = (uname) => uname.toLowerCase().replace(/[^A-Za-z0-9]/g, '');

/** @param {UserConfig} eleventyConfig */
module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static/*/*");
  eleventyConfig.addPassthroughCopy({
    "ext/silk/dist/sprite/famfamfam-silk.min.css": "static/css/silk.css",
    "ext/silk/dist/sprite/famfamfam-silk.png": "static/css/famfamfam-silk.png"
  });

  eleventyConfig.addFilter("jmespath", (data, query) => {
    return jmespath.search(data, query);
  });
  eleventyConfig.addFilter("member", (member) => {
    return `<a href="/members/${member.uname}">${member.uname}</a>`
  });
  eleventyConfig.addFilter("member_full", (member) => {
    const y = get_election_year();
    let out = "";
    if (member.positions) {
      for (let pos of member.positions) {
        if (pos.period === y) {
          if (pos.pos === 0) out += '<div class="famfamfam-silk bullet_star"></div>';
          if (pos.pos === 1) out += '<div class="famfamfam-silk bullet_yellow"></div>';
        }
      }
    }
    if (member.redacted) out += `<strong>${member.uname}</strong>`;
    else out += `<a href="https://twocansandstring.com/users/${url_friendly(member.uname)}">${member.uname}</a>`;
    return out;
  })


  eleventyConfig.addShortcode("get_role", 
  /**
   * @param {string} role
   * @param {number} period
   * @param {boolean} annual
   */
  (role, period = 0, annual = true) => {
    if (!period && annual) {
      // if the role hasnt been elected yet then use the one from the previous year
      period = get_election_year();
    };
    let usr = "";
    for (let member of members) {
      if (!member.positions) continue;
      for (let pos of member.positions) {
        if (pos.pos === role) {
          if (annual && pos.period === period) {
            usr = member;
            break;
          } else if (!annual) {
            usr = member;
            break;
          }
        }
      }
    }
    return usr;
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
