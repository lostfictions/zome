const path = require("path");

module.exports = ({ config }) => {
  const cssRule = config.module.rules.find(rule =>
    rule.test.toString().endsWith(".css$/")
  );

  if (!cssRule) {
    throw new Error("CSS loader rule not found!");
  }

  config.module.rules.push(
    {
      test: /\.tsx?$/,
      use: [
        {
          loader: require.resolve("babel-loader"),
          options: {
            presets: [require.resolve("babel-preset-react-app")]
          }
        },
        {
          loader: require.resolve("react-docgen-typescript-loader"),
          options: {
            tsconfigPath: path.join(__dirname, "../tsconfig.json")
          }
        }
      ]
    },
    {
      ...cssRule,
      test: /\.module\.css$/i,
      use: [
        cssRule.use[0],
        {
          ...cssRule.use[1],
          options: {
            ...cssRule.use[1].options,
            modules: true
          }
        }
      ]
    }
  );

  cssRule.exclude = /\.module\.css$/i;
  cssRule.use[1].options.modules = false;

  config.resolve.extensions.push(".ts", ".tsx");

  return config;
};
