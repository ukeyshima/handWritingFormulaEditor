import React from "react";
import { inject, observer } from "mobx-react";
import ExtensionSelection from "./extensionSelection.jsx";

@inject("state")
@observer
export default class CreateTextFileForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: "main",
      extensionName: "js",
      createButtonFontColor: "#000"
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleExtensionChange = this.handleExtensionChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }
  handleInputChange(e) {
    this.setState({ inputValue: e.target.value });
  }
  handleExtensionChange(extension) {
    this.setState({
      extensionName: extension
    });
  }
  handleClick() {
    const text = this.props.state.editor.getValue();
    this.props.state.updateActiveText(text);
    this.props.state.incrementId();
    const id = this.props.state.id;
    const type = (() => {
      let result;
      switch (this.state.extensionName) {
        case "js":
          result = "javascript";
          break;
        case "css":
          result = "css";
          break;
        case "glsl":
          result = "glsl";
          break;
      }
      return result;
    })();
    this.props.state.pushTextFile({
      id: id,
      type: type,
      fileName: this.state.inputValue + "." + this.state.extensionName,
      removed: false,
      text: ""
    });
    this.props.state.editor.session.getUndoManager().reset();
  }
  handleMouseEnter() {
    this.setState({
      createButtonFontColor: "#e38"
    });
  }
  handleMouseLeave() {
    this.setState({
      createButtonFontColor: "#000"
    });
  }
  render() {
    return (
      <div
        className="dropDown"
        id="createTextForm"
        style={{
          top: this.props.y,
          left: this.props.x
        }}
      >
        <input
          type="text"
          id="fileName"
          value={this.state.inputValue}
          onChange={this.handleInputChange}
        />
        <ExtensionSelection extensionchange={this.handleExtensionChange} />
        <button
          id="createButton"
          style={{
            color: this.state.createButtonFontColor
          }}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onClick={this.handleClick}
        >
          create
        </button>
      </div>
    );
  }
}
