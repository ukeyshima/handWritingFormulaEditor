import React from 'react';
import RunButton from './runButton';
import StopButton from './stopButton';
import CreateHandWritingFormulaArea from './createHandWritingFormulaAreaButton';
import CreateHandWritingFormulaAreaList from './createHandWritingFormulaAreaList';
import RecycleHandWritingFormula from './recycleHandWritingFormula';

export default class RunAndStop extends React.Component {
  render() {
    return (
      <div id="runAndStop">
        <RunButton />
        <StopButton />
        <CreateHandWritingFormulaArea />
        {/*<CreateHandWritingFormulaAreaList />
        <RecycleHandWritingFormula />*/}
      </div>
    );
  }
}
