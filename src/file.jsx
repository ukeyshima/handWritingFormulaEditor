import React from "react";
import FileSelect from "./fileSelect.jsx";

export default class File extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontColor: "#444",
      click: false,
      clickX: 0,
      clickY: 0
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }
  componentDidMount() {
    document.addEventListener("click", this.handleDocumentClick);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.handleDocumentClick);
  }
  handleClick(e) {
    const clickX = e.nativeEvent.x;
    const clickY = e.nativeEvent.y;
    this.setState({
      click: true,
      clickX: clickX,
      clickY: clickY
    });
  }
  handleDocumentClick(e) {
    if (e.target.id !== "file") {
      this.setState({
        click: false
      });
    }
  }
  handleMouseEnter() {
    this.setState({
      fontColor: "#e38"
    });
  }
  handleMouseLeave() {
    this.setState({
      fontColor: "#444"
    });
  }
  render() {
    return (
      <React.Fragment>
        <button
          id="file"
          style={{
            color: this.state.fontColor
          }}
          onMouseLeave={this.handleMouseLeave}
          onMouseEnter={this.handleMouseEnter}
          onClick={this.handleClick}
        >
          file
        </button>
        {(() => {
          if (this.state.click) {
            return (
              <FileSelect
                style={{
                  x: this.state.clickX,
                  y: this.state.clickY
                }}
              />
            );
          }
        })()}
      </React.Fragment>
    );
  }
}
