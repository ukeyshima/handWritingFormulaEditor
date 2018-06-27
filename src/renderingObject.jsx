import React from "react";
import Editor from "./editor.jsx";
import SizeChangeBar from "./sizeChangeBar.jsx";
import RunFrame from "./runFrame.jsx";
import HandWritingFormulaArea from "./handWritingFormulaArea.jsx";
import FormulaInCodeRendering from "./formulaInCodeRendering.jsx";
import { inject, observer } from "mobx-react";
//import { toJS } from "mobx";

@inject("state")
@observer
export default class RenderingObject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formulaInCode: []
    };
    this.handleChangeFormulaInCodeAnchor = this.handleChangeFormulaInCodeAnchor.bind(
      this
    );
    this.handleUpdateFormulaInCode = this.handleUpdateFormulaInCode.bind(this);    
  }
  componentDidMount() {
    this.props.state.updateUpdateFormulaInCode(this.handleUpdateFormulaInCode);
    this.props.state.updateChangeFormulaInCodeAnchor(
      this.handleChangeFormulaInCodeAnchor
    );
  }
  handleUpdateFormulaInCode(obj) {
    const formulaInCode = this.state.formulaInCode;
    formulaInCode.push(obj);
    this.setState({
      formulaInCode: formulaInCode
    });
    this.props.state.incrementFormulaInCodeId();
  }
  handleChangeFormulaInCodeAnchor(num, x, y, bool) {
    if (!this.props.state.dontExecute) {
      this.props.state.updateShouldEditorUpdate(false);
      const formulaInCode = this.state.formulaInCode;
      formulaInCode[num].x = x;
      formulaInCode[num].y = y;
      formulaInCode[num].visible = bool;
      this.setState({
        formulaInCode: formulaInCode
      });
      this.props.state.updateShouldEditorUpdate(true);
    }
  }
  render() {
    const renderingObject = this.props.state.renderingObject;
    return (
      <React.Fragment>
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
                      color: "#fff"
                    }}
                  />
                </React.Fragment>
              );
            }
          });
        })()}
        {(() => {
          return this.state.formulaInCode.map((e, key) => {
            if (e.visible) {
              return (
                <FormulaInCodeRendering
                  key={key}
                  style={{
                    width: e.width,
                    height: e.height,
                    top: e.y,
                    left: e.x,
                    backgroundImage: `url(${e.url})`
                  }}
                />
              );
            }
          });
        })()}
      </React.Fragment>
    );
  }
}
