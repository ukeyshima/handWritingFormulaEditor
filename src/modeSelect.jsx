import React from 'react';
import HotReloadButton from './hotReloadButton';
import APIKeyShift from './apiKeyShift';
import ErrorDelete from './errorDelete';
import DemoButton from './demoButton';
import DemoButton2 from './demoButton2';
import DemoButton3 from './demoButton3';
import DemoButton4 from './demoButton4';
import NoiseButton from './noiseButton';
import DefaultButton from './defaultButton';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class ModeSelect extends React.Component {
  render() {
    return (
      <div
        touch-action='auto'
        className='dropDown'
        id='modeSelect'
        style={{
          position: 'absolute',
          left: this.props.style.x,
          top: this.props.style.y
        }}
      >
        {/*<HotReloadButton />
        <APIKeyShift />
        <ErrorDelete />
        <DemoButton />
        <DemoButton2 />
        <DemoButton3 />
        <DemoButton4 />
        <ExperimentButton2 />*/}
        <NoiseButton />
        <DefaultButton />
      </div>
    );
  }
}
