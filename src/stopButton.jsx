import React from "react";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class StopButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: "#eee",
      fontColor: "#e38"
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }
  componentDidMount() {
    this.props.state.updateStopButton(this.refs.stopButton);
  }
  handleClick() {
    this.props.state.updateActiveText(this.props.state.editor.getValue());
    this.props.state.removeRenderingObject("run");
    this.props.state.updateRunButtonColor({
      backgroundColor: "#eee",
      fontColor: "#e38"
    });
    this.props.state.updateIframeElement(null);
    this.props.state.updateHotReload(false);
  }
  handleMouseEnter() {
    this.setState({
      backgroundColor: "#e38",
      fontColor: "#eee"
    });
  }
  handleMouseLeave() {
    this.setState({
      backgroundColor: "#eee",
      fontColor: "#e38"
    });
  }
  render() {
    return (
      <button
        ref="stopButton"
        id="stop"
        style={{
          backgroundColor: this.state.backgroundColor,
          color: this.state.fontColor
        }}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        ■
      </button>
    );
  }
}
