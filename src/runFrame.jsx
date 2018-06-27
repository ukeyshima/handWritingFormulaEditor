import React from "react";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class RunFrame extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.width = window.innerWidth;
  }
  componentDidMount() {
    this.props.state.updateIframeElement(this.refs.iframe);
    this.refs.iframe.addEventListener("load", () => {
      this.refs.iframe.contentDocument.addEventListener(
        "mousemove",
        this.handleMouseMove
      );
      this.refs.iframe.contentDocument.addEventListener(
        "mouseup",
        this.handleMouseUp
      );
    });
    window.addEventListener("resize", this.handleResize);
  }
  componentWillUnmount() {
    this.props.state.updateIframeElement(null);
    this.refs.iframe.contentDocument.removeEventListener(
      "mousemove",
      this.handleMouseMove
    );
    this.refs.iframe.contentDocument.removeEventListener(
      "mouseup",
      this.handleMouseUp
    );
    window.removeEventListener("resize", this.handleResize);
  }
  handleResize(e) {
    let diff = -3;
    this.props.state.renderingObject.forEach(e => {
      diff += 3;
      if (e.type == "run") {
        diff += 4;
      }
    });
    const per = (window.innerWidth - diff) / (this.width - diff);
    const width = this.props.state.renderingObject[this.props.num].width;
    this.props.state.sizeChange(this.props.num, width * per);
    this.width = window.innerWidth;
  }
  handleMouseMove(e) {
    if (this.props.state.renderingObject[this.props.num].scrolling) {
      const width = this.props.state.renderingObject[this.props.num].width;
      const diff = e.clientX;
      const frontElementWidth = this.props.state.renderingObject[
        this.props.num - 1
      ].width;
      this.props.state.sizeChange(this.props.num - 1, frontElementWidth + diff);
      this.props.state.sizeChange(this.props.num, width - diff);
      if (
        this.props.state.renderingObject[this.props.num - 1].type ===
        "handWritingFormulaArea"
      ) {
        this.props.state.handWritingFormulaArea.resize();
      }
    }
    if (this.props.state.renderingObject.length > this.props.num + 1) {
      if (this.props.state.renderingObject[this.props.num + 1].scrolling) {
        const width = this.props.state.renderingObject[this.props.num].width;
        const diff = width - e.clientX;
        const nextElementWidth = this.props.state.renderingObject[
          this.props.num + 1
        ].width;
        this.props.state.sizeChange(
          this.props.num + 1,
          nextElementWidth + diff
        );
        this.props.state.sizeChange(this.props.num, width - diff);
        if (
          this.props.state.renderingObject[this.props.num + 1].type ===
          "handWritingFormulaArea"
        ) {
          this.props.state.handWritingFormulaArea.resize();
        }
      }
    }
  }
  handleMouseUp(e) {
    this.props.state.scrolling(this.props.num, false);
    if (this.props.state.renderingObject.length > this.props.num + 1) {
      this.props.state.scrolling(this.props.num + 1, false);
    }
  }
  render() {
    return (
      <div onMouseUp={this.handleMouseUp}>
        <iframe ref="iframe" style={this.props.style} />
      </div>
    );
  }
}
