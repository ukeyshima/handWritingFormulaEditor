import React from "react";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class RunButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.executeHTML = this.executeHTML.bind(this);
  }
  componentDidMount() {
    this.props.state.updateRunButton(this.refs.runButton);
    this.props.state.updateExecuteHTML(this.executeHTML);
  }
  handleClick() {
    this.props.state.updateActiveText(this.props.state.editor.getValue());
    if (!this.props.state.iframeElement) {
      const num = this.props.state.renderingObject.length;
      const width = this.props.state.renderingObject[num - 1].width;
      const diff = width * 0.3;
      this.props.state.sizeChange(num - 1, width * 0.7);
      this.props.state.pushRenderingObject({
        type: "run",
        width: diff - 3 - 4,
        scrolling: false
      });
      setTimeout(() => {
        this.executeHTML();
        this.props.state.editor.session.$undoManager.$undoStack.push([
          {
            group: "doc",
            deltas: [
              {
                start: this.props.state.editor.getCursorPosition(),
                end: this.props.state.editor.getCursorPosition(),
                action: "run",
                lines: [""]
              }
            ]
          }
        ]);
      }, 1);
    }
  }
  executeHTML() {
    const domParser = new DOMParser();
    let document_obj = null;
    const textFile = this.props.state.textFile;
    try {
      document_obj = domParser.parseFromString(textFile[0].text, "text/html");
      if (document_obj.getElementsByTagName("parsererror").length) {
        document_obj = null;
      }
    } catch (e) {
      console.log(e);
    }
    if (document_obj) {
      const scripts = document_obj.getElementsByTagName("script");
      const links = document_obj.getElementsByTagName("link");
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src) {
          const targetOfJs = textFile.find(e => {
            return (
              e.fileName ===
              scripts[i].src.split("/")[scripts[i].src.split("/").length - 1]
            );
          });

          const blob = new Blob([targetOfJs.text], {
            type: "application/javascript"
          });
          scripts[i].src = URL.createObjectURL(blob);
        } else {
          const targetOfNotJs = textFile.find(e => {
            return e.fileName === scripts[i].type;
          });
          scripts[i].text = targetOfNotJs.text;
        }
      }
      for (let i = 0; i < links.length; i++) {
        const targetOfCss = textFile.find(e => {
          return (
            e.type === "css" &&
            links[i].rel === "stylesheet" &&
            links[i].href.split("/")[links[i].href.split("/").length - 1] ===
              e.fileName
          );
        });
        if (targetOfCss) {
          const blob = new Blob([targetOfCss.text], { type: "text/css" });
          links[i].href = URL.createObjectURL(blob);
        }
      }
      const blob = new Blob([document_obj.documentElement.outerHTML], {
        type: "text/html"
      });
      this.props.state.iframeElement.contentWindow.location.replace(
        URL.createObjectURL(blob)
      );
    }
  }
  handleMouseEnter() {
    this.props.state.updateRunButtonColor({
      backgroundColor: "#e38",
      fontColor: "#eee"
    });
  }
  handleMouseLeave() {
    if (!this.props.state.iframeElement) {
      this.props.state.updateRunButtonColor({
        backgroundColor: "#eee",
        fontColor: "#e38"
      });
    }
  }
  render() {
    return (
      <button
        ref="runButton"
        id="run"
        style={{
          backgroundColor: this.props.state.runButtonColor.backgroundColor,
          color: this.props.state.runButtonColor.fontColor
        }}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        ▶︎
      </button>
    );
  }
}
