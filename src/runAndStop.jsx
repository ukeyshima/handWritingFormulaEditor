import React from 'react';
import RunButton from './runButton.jsx';
import StopButton from './stopButton.jsx';
import CreateHandWritingFormulaArea from './createHandWritingFormulaAreaButton.jsx';
export default class RunAndStop extends React.Component {
  render() {
    return (
      <div id="runAndStop">
        <RunButton />
        <StopButton />
        <CreateHandWritingFormulaArea />
      </div>
    );
  }
}
