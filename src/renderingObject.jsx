import React from 'react';
import Editor from './editor.jsx';
import RunArea from './runArea.jsx';
import HandWritingFormulaAreaWrapper from './handwritingFormulaAreaWrapper.jsx';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

@inject('state')
@observer
export default class RenderingObject extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Editor ref="editor" />
        {(() => {
          if (this.props.state.runAreaRenderingFlag) {
            return (
              <RunArea
                style={{
                  position: 'absolute',
                  left: this.props.state.runAreaPosition.x,
                  top: this.props.state.runAreaPosition.y,
                  width: 400,
                  height: 400,
                  borderRadius: 5,
                  boxShadow: '2px 2px 10px grey',
                  zIndex: 26
                }}
              />
            );
          }
        })()}
        {this.props.state.activeTextFile.handWritingFormulaAreas.map((e, i) => {
          return (
            e.visible && (
              <HandWritingFormulaAreaWrapper
                style={{
                  position: 'absolute',
                  width: Math.floor(e.width),
                  height: Math.floor(e.height),
                  top: e.y,
                  left: e.x
                }}
                model={toJS(e.model)}
                startrow={e.startRow}
                status={e}
                num={i}
                key={i}
              />
            )
          );
        })}
      </React.Fragment>
    );
  }
}
