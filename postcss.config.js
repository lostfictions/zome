// see default postcss config used by next:
// https://nextjs.org/docs/advanced-features/customizing-postcss-config
module.exports = {
  plugins: {
    "postcss-flexbugs-fixes": {},
    "postcss-preset-env": {
      autoprefixer: {
        flexbox: "no-2009"
      },
      stage: 3,
      features: {
        "nesting-rules": true,
        "custom-media-queries": true
      },
      importFrom: "src/styles/vars.css"
    }
  }
};

// just our config:
// module.exports = {
//   plugins: {
//     "postcss-preset-env": {
//       features: {
//         "nesting-rules": true,
//         "custom-media-queries": true
//       },
//       importFrom: "src/styles/vars.css"
//     }
//   }
// };
