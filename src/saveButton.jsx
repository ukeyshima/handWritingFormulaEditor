import React from "react";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class SaveButton extends React.Component {
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
    let data = this.props.state.editor.getValue();
    if (this.props.state.activeTextFile.fileName === "index.html") {
      const domParser = new DOMParser();
      let document_obj = null;
      try {
        document_obj = domParser.parseFromString(
          this.props.state.activeTextFile.text,
          "text/html"
        );
        if (document_obj.getElementsByTagName("parsererror").length) {
          document_obj = null;
        }
      } catch (e) {
        console.log(e);
      }
      if (document_obj) {
        const scripts = document_obj.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
          if (scripts[i].type) {
            const textFile = this.props.state.textFile.find(e => {
              return e.fileName === scripts[i].type;
            });
            scripts[i].text = textFile.text;
          }
        }
        data = document_obj.documentElement.outerHTML;
      }
    }
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
    const a = document.createElement("a");
    a.textContent = "save";
    a.download = this.props.state.activeTextFile.fileName;
    a.href = window.URL.createObjectURL(
      new Blob([data], { type: "text/plain" })
    );
    a.dataset.downloadurl = ["text/plain", a.download, a.href].join(":");
    a.dispatchEvent(e);
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
        save
      </button>
    );
  }
}
