import React from "react";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class HotReloadButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontColor: "#000"
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }
  handleClick() {
    const run = this.props.state.renderingObject.find(e => {
      return e.type === "run";
    });
    const bool = this.props.state.hotReload;
    this.props.state.updateHotReload(!bool);
    const e = document.createEvent("MouseEvents");
    e.initMouseEvent(
      "click",
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
    if (run) {
      this.props.state.stopButton.dispatchEvent(e);
    } else {
      this.props.state.runButton.dispatchEvent(e);
      this.props.state.updateRunButtonColor({
        backgroundColor: "#e38",
        fontColor: "#eee"
      });
    }
  }
  handleMouseLeave() {
    this.setState({
      fontColor: "#000"
    });
  }
  handleMouseEnter() {
    this.setState({
      fontColor: "#e38"
    });
  }
  render() {
    return (
      <button
        style={{
          color: this.state.fontColor
        }}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        HotReload
      </button>
    );
  }
}
