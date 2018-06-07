import React from "react";
import ReactDOM from "react-dom";
import HotReloadButton from "./hotReloadButton.jsx";
import CreateHandWritingFormulaArea from "./createHandWritingFormulaAreaButton.jsx";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class ModeSelect extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div
        className="dropDown"
        id="modeSelect"
        style={{
          position: "absolute",
          left: this.props.style.x,
          top: this.props.style.y
        }}
      >
        <HotReloadButton/>
        <CreateHandWritingFormulaArea/>
      </div>
    );
  }
}

