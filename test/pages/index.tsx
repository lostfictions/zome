import React from "react";
import ReactDOM from "react-dom";

xdescribe("Featured section", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<div>butt</div>, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
