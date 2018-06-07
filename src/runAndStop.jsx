import React from "react";
import ReactDOM from "react-dom";
import RunButton from "./runButton.jsx";
import StopButton from "./stopButton.jsx";
export default class RunAndStop extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
      return <div id="runAndStop" >
        <RunButton/>
        <StopButton/>
      </div>;
    }
  }