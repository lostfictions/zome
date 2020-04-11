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

        // enable astroturf
        cfg.module.rules.push({
          test: /\.tsx$/,
          use: [
            {
              loader: "astroturf/loader",
              options: { extension: ".module.css" }
            }
          ]
        });

        return cfg;
      }
    }),
    fonts
    // optimizedImages
  ],
  {
    poweredByHeader: false,
    reactStrictMode: true
  }
);
