import React from 'react';
import HotReloadButton from './hotReloadButton.jsx';
import APIKeyShift from './apiKeyShift.jsx';
import ErrorDelete from './errorDelete.jsx';
import DemoButton from './demoButton.jsx';
import DemoButton2 from './demoButton2.jsx';
import DemoButton3 from './demoButton3.jsx';
import DemoButton4 from './demoButton4.jsx';
import ExperimentButton from './experimentButton.jsx';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class ModeSelect extends React.Component {
  render() {
    return (
      <div
        className="dropDown"
        id="modeSelect"
        style={{
          position: 'absolute',
          left: this.props.style.x,
          top: this.props.style.y
        }}
      >
        <HotReloadButton />
        <APIKeyShift />
        <ErrorDelete />
        <DemoButton />
        <DemoButton2 />
        <DemoButton3 />
        <DemoButton4 />
        <ExperimentButton />
      </div>
    );
  }
}
