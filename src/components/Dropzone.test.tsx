import React from "react";
import ReactDOM from "react-dom";

import Dropzone from "./Dropzone";

describe("Featured section", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Dropzone />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
