/* eslint no-undef: error */
const path = require("path");

const withPlugins = require("next-compose-plugins");
const fonts = require("next-fonts");
// const optimizedImages = require("next-optimized-images");

module.exports = withPlugins(
  [
    () => ({
      webpack(cfg) {
        // allow root-relative paths with the "~" prefix
        cfg.resolve.alias["~"] = path.join(__dirname, "src");
        return cfg;
      }
    }),
    fonts
    // optimizedImages
  ],
  {
    experimental: { css: true },
    poweredByHeader: false
  }
);
