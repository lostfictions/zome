/* eslint no-undef: error */
const withPlugins = require("next-compose-plugins");
const fonts = require("next-fonts");
// const optimizedImages = require("next-optimized-images");

module.exports = withPlugins(
  [
    () => ({
      webpack(cfg) {
        // enable astroturf
        cfg.module.rules.push({
          test: /\.tsx$/,
          use: [
            {
              loader: "astroturf/loader",
              options: { extension: ".module.css" },
            },
          ],
        });

        return cfg;
      },
    }),
    fonts,
    // optimizedImages
  ],
  {
    poweredByHeader: false,
    reactStrictMode: true,
  }
);
