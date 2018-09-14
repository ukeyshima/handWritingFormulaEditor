import React from 'react';
import Editor from './editor.jsx';
import RunArea from './runArea.jsx';
import HandWritingFormulaAreaWrapper from './handwritingFormulaAreaWrapper.jsx';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class RenderingObject extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Editor />
        {(() => {
          if (this.props.state.runAreaRenderingFlag) {
            return (
              <RunArea
                style={{
                  position: 'absolute',
                  left: this.props.state.runAreaPosition.x,
                  top: this.props.state.runAreaPosition.y,
                  width: 500,
                  height: 500,
                  borderRadius: 5,
                  boxShadow: '2px 2px 10px grey',
                  zIndex: 24
                }}
              />
            );
          }
        })()}
        {this.props.state.handWritingFormulaAreas.map((e, i) => {
          return (
            <HandWritingFormulaAreaWrapper
              style={{
                position: 'absolute',
                width: Math.floor(e.width),
                height: Math.floor(e.height),
                top: e.y,
                left: e.x,
                visibility: e.visible ? 'visible' : 'hidden'
              }}
              status={e}
              num={i}
              key={i}
            />
          );
        })}
      </React.Fragment>
    );
  }
}
