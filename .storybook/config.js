import { configure, addDecorator } from "@storybook/react";
import { withInfo } from "@storybook/addon-info";
import { IntlProvider } from "react-intl";

import "../src/styles/index.css";

addDecorator(withInfo({ inline: true }));
addDecorator(storyFn => <IntlProvider locale="en">{storyFn()}</IntlProvider>);

configure(require.context("../stories", true, /\.tsx?$/), module);
