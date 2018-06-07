import React from "react";
import ReactDOM from "react-dom";
import Editor from "./editor.jsx";
import SizeChangeBar from "./sizeChangeBar.jsx";
import RunFrame from "./runFrame.jsx";
import HandWritingFormulaArea from "./handWritingFormulaArea.jsx";

import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class RenderingObject extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const renderingObject = this.props.state.renderingObject;

    return (
      <div>
        {(() => {
          return renderingObject.map((e, i) => {
            if (e.type === "editor") {
              return (
                <React.Fragment key={i}>
                  <Editor
                    num={i}
                    style={{
                      width: e.width,
                      height: "calc(100vh - 110px)",
                      float: "left"
                    }}
                  />
                </React.Fragment>
              );
            } else if (e.type === "run") {
              return (
                <React.Fragment key={i}>
                  <SizeChangeBar num={i} />
                  <RunFrame
                    num={i}
                    style={{
                      width: e.width,
                      height: "calc(100vh - 110px)",
                      float: "left"
                    }}
                  />
                </React.Fragment>
              );
            } else if (e.type === "handWritingFormulaArea") {
              return (
                <React.Fragment key={i}>
                  <SizeChangeBar num={i} />
                  <HandWritingFormulaArea
                    num={i}
                    style={{
                      width: e.width,
                      height: "calc(100vh - 110px)",
                      float: "left",
                      backgroundColor: "#000",
                      color:"#fff"
                    }}
                  />
                </React.Fragment>
              );
            }
          });
        })()}
      </div>
    );
  }
}
