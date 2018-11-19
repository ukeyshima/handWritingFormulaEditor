import React from 'react';
import Editor from './editor.jsx';
import RunArea from './runArea.jsx';
import ListArea from './listArea.jsx';
import HandWritingFormulaAreaWrapper from './handwritingFormulaAreaWrapper.jsx';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';

@inject(({ state }) => ({
  runAreaRenderingFlag: state.runAreaRenderingFlag,
  listAreaRenderingFlag: state.listAreaRenderingFlag,
  runAreaPosition: state.runAreaPosition,
  textFile: state.textFile
}))
@observer
export default class RenderingObject extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Editor />
        {this.props.runAreaRenderingFlag && (
          <RunArea
            style={{
              position: 'absolute',
              left: this.props.runAreaPosition.x,
              top: this.props.runAreaPosition.y,
              width: 400,
              height: 400,
              borderRadius: 5,
              boxShadow: '2px 2px 10px grey',
              zIndex: 26
            }}
          />
        )}
        {this.props.listAreaRenderingFlag && <ListArea />}
        {this.props.textFile.map((e, j) => {
          return e.handWritingFormulaAreas.map((f, i) => {
            return (
              <HandWritingFormulaAreaWrapper
                style={{
                  position: 'absolute',
                  width: Math.floor(f.width),
                  height: Math.floor(f.height),
                  top: f.y,
                  left: f.x,
                  visibility: f.visible ? 'visible' : 'hidden'
                }}
                status={f}
                textfilenum={j}
                num={i}
                key={i}
              />
            );
          });
        })}
      </React.Fragment>
    );
  }
}
