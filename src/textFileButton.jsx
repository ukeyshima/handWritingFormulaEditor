import React from "react";
import ReactDOM from "react-dom";
import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class TextFileButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseEnter: false,
      deleteMouseEnter: false
    };
    this.handleClick=this.handleClick.bind(this);
    this.handleDeleteClick=this.handleDeleteClick.bind(this);
    this.handleDeleteMouseEnter=this.handleDeleteMouseEnter.bind(this);
    this.handleDeleteMouseLeave=this.handleDeleteMouseLeave.bind(this);
    this.handleMouseEnter=this.handleMouseEnter.bind(this);
    this.handleMouseLeave=this.handleMouseLeave.bind(this);
  }
  handleMouseEnter() {
    this.setState({
      mouseEnter: true,
      deleteMouseEnter: false
    });
  }
  handleMouseLeave() {
    this.setState({
      mouseEnter: false,
      deleteMouseEnter: false
    });
  }
  handleDeleteMouseEnter() {
    this.setState({
      deleteMouseEnter: true
    });
  }
  handleDeleteMouseLeave() {
    this.setState({
      deleteMouseEnter: false
    });
  }
  handleClick( fileName, e) {
    if (e.target.id !== "delete") {
      this.props.state.updateDontExecute(true);
      const text = this.props.state.editor.getValue();
      this.props.state.updateActiveText(text);      
      const textFile = this.props.state.textFile;
      const activeFile = textFile.find(e => {
        return e.fileName === fileName;
      });
      this.props.state.changeActiveTextFile(activeFile);
      this.props.state.editor.setValue(this.props.state.activeTextFile.text);     
    }
  }
  handleDeleteClick(fileName) {
    this.props.state.updateDontExecute(true);
    const textFile = this.props.state.textFile;
    const activeFile = this.props.state.activeTextFile.fileName===fileName?  textFile[0]:this.props.state.activeTextFile;
    this.props.state.editor.setValue(activeFile.text);
    this.props.state.changeActiveTextFile(activeFile);
    const targetFile = textFile.find((e, i) => {
      return e.fileName === fileName;
    });
    this.props.state.removeTextFile(targetFile);
  }
  render() {
    return (
      <button
        style={(() => {
          const active =
            this.props.state.activeTextFile.fileName === this.props.fileName;
          const mouseEnter = this.state.mouseEnter;
          return {
            color: active
              ? mouseEnter
                ? "#000"
                : "#fff"
              : mouseEnter
                ? "#e38"
                : "#000",
            backgroundColor: active ? "#e38" : "#ccc"
          };
        })()}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
        onClick={e => this.handleClick(this.props.fileName, e)}
      >
        {(() => {
          if (this.props.fileName !== "index.html") {
            return (
              <p
                id="delete"
                onMouseEnter={this.handleDeleteMouseEnter}
                onMouseLeave={this.handleDeleteMouseLeave}
                style={(() => {
                  const active =
                    this.props.state.activeTextFile.fileName ===
                    this.props.fileName;
                  const mouseEnter = this.state.mouseEnter;
                  const deleteMouseEnter = this.state.deleteMouseEnter;
                  return {
                    color: active
                      ? mouseEnter
                        ? deleteMouseEnter
                          ? "#fff"
                          : "#000"
                        : deleteMouseEnter
                          ? "#000"
                          : "#fff"
                      : mouseEnter
                        ? deleteMouseEnter
                          ? "#000"
                          : "#e38"
                        : deleteMouseEnter
                          ? "#e38"
                          : "#000",
                    margin: "0 10px 0 0",
                    float: "left"
                  };
                })()}
                onClick={() =>
                  this.handleDeleteClick( this.props.fileName)
                }
              >
                ×
              </p>
            );
          }
        })()}
        <p
          style={{
            margin: 0,
            float: "left"
          }}
        >
          {this.props.fileName}
        </p>
      </button>
    );
  }
}
