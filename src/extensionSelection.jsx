import React from "react";
import ReactDOM from "react-dom";
import Extensions from "./extensions.jsx";

export default class ExtensionSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: "js",
      fontColor: "#000",
      click: false
    };
    this.handleClick=this.handleClick.bind(this);
    this.handleExtensionsClick=this.handleExtensionsClick.bind(this);
    this.handleMouseEnter=this.handleMouseEnter.bind(this);
    this.handleMouseLeave=this.handleMouseLeave.bind(this);    
    this.selectionChange=this.selectionChange.bind(this);
  }

  handleClick(e) {
    this.setState({
      click: true
    });
  }
  handleExtensionsClick(e) {
    this.setState({
      click: false
    });
  }
  handleMouseEnter() {
    this.setState({
      fontColor: "#e38"
    });
  }
  handleMouseLeave() {
    this.setState({
      fontColor: "#000"
    });
  }
  selectionChange(selection) {
    this.setState({
      selection: selection
    });
  }
  render() {
    return (
      <React.Fragment>
        <p
          id="extensionSelection"
          style={{
            color: this.state.fontColor
          }}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
          onClick={this.handleClick}
        >
          {this.state.selection + " ▽"}
        </p>
        {(() => {
          if (this.state.click) {
            return (
              <Extensions
                handleextensionsclick={this.handleExtensionsClick}
                selectionchange={this.selectionChange}
                extensionchange={this.props.extensionchange}
              />
            );
          }
        })()}
      </React.Fragment>
    );
  }
}
