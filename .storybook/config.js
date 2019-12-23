import { configure, addDecorator } from "@storybook/react";
import { withInfo } from "@storybook/addon-info";

import "../src/styles/index.css";

addDecorator(withInfo({ inline: true }));
addDecorator(storyFn => <div>{storyFn()}</div>);

configure(require.context("../stories", true, /\.tsx?$/), module);
